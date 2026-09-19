#!/usr/bin/env node
// PreToolUse hook (matcher: Bash) that enforces the Git Flow rules from
// CLAUDE.md deterministically instead of relying on the model remembering them:
//
//   feature/* -> development -> staging -> main
//
// It blocks (exit code 2, message on stderr) commands that:
//   - `git commit` while on main / staging / development
//   - `git push` that targets main / staging / development, or force-pushes
//   - `gh pr create` without --base, or with a base that breaks the flow
//
// The command is tokenized (quotes, heredocs, $(...), &&, ||, ;, |) so that
// text inside a commit message, PR body or heredoc never triggers a rule.
// Anything inside $(...) is treated as opaque text and is NOT inspected.

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PROTECTED = new Set(["main", "staging", "development"]);

/** Parses `<<EOF`, `<<'EOF'`, `<<"EOF"`, `<<-EOF` at `i`. Returns null if not a heredoc. */
function parseHeredocStart(input, i) {
  if (input[i] !== "<" || input[i + 1] !== "<" || input[i + 2] === "<") return null;
  let j = i + 2;
  if (input[j] === "-") j++;
  while (input[j] === " ") j++;
  const quote = input[j] === "'" || input[j] === '"' ? input[j++] : null;
  let delim = "";
  while (j < input.length && (quote ? input[j] !== quote : /[\w.-]/.test(input[j]))) {
    delim += input[j++];
  }
  if (quote) j++;
  return { delim, next: j };
}

/** Index just after the line that terminates a heredoc body starting after `from`'s newline. */
function skipHeredocBody(input, from, delim) {
  const firstNewline = input.indexOf("\n", from);
  if (firstNewline === -1) return input.length;
  let pos = firstNewline + 1;
  while (pos < input.length) {
    const eol = input.indexOf("\n", pos);
    const line = input.slice(pos, eol === -1 ? input.length : eol).trim();
    pos = eol === -1 ? input.length : eol + 1;
    if (line === delim) break;
  }
  return pos;
}

/** `i` points at the "(" of "$(". Returns the index of the matching ")". */
function skipSubshell(input, i) {
  let depth = 0;
  for (let j = i; j < input.length; j++) {
    const c = input[j];
    if (c === "'") {
      const end = input.indexOf("'", j + 1);
      j = end === -1 ? input.length : end;
    } else if (c === '"') {
      j++;
      while (j < input.length && input[j] !== '"') {
        if (input[j] === "\\") j++;
        else if (input[j] === "$" && input[j + 1] === "(") j = skipSubshell(input, j + 1);
        j++;
      }
    } else if (c === "<") {
      const heredoc = parseHeredocStart(input, j);
      if (heredoc) {
        // resume on the delimiter's own line so a trailing ")" is still seen
        const after = skipHeredocBody(input, heredoc.next, heredoc.delim);
        j = input.lastIndexOf("\n", after - 2);
      }
    } else if (c === "(") {
      depth++;
    } else if (c === ")") {
      depth--;
      if (depth === 0) return j;
    }
  }
  return input.length;
}

/** Splits a shell command into simple commands, each a list of unquoted words. */
export function tokenize(input) {
  const commands = [];
  let words = [];
  let word = "";
  let inWord = false;
  const pendingHeredocs = [];

  const endWord = () => {
    if (inWord) words.push(word);
    word = "";
    inWord = false;
  };
  const endCommand = () => {
    endWord();
    if (words.length) commands.push(words);
    words = [];
  };

  for (let i = 0; i < input.length; i++) {
    const c = input[i];

    if (c === "\\" && i + 1 < input.length) {
      if (input[i + 1] === "\n") {
        i++; // line continuation
      } else {
        word += input[++i];
        inWord = true;
      }
    } else if (c === "$" && input[i + 1] === "(") {
      const end = skipSubshell(input, i + 1);
      word += input.slice(i, end + 1);
      inWord = true;
      i = end;
    } else if (c === "'") {
      inWord = true;
      const end = input.indexOf("'", i + 1);
      const stop = end === -1 ? input.length : end;
      word += input.slice(i + 1, stop);
      i = stop;
    } else if (c === '"') {
      inWord = true;
      i++;
      while (i < input.length && input[i] !== '"') {
        if (input[i] === "\\" && i + 1 < input.length) {
          word += input[++i];
        } else if (input[i] === "$" && input[i + 1] === "(") {
          const end = skipSubshell(input, i + 1);
          word += input.slice(i, end + 1);
          i = end;
        } else {
          word += input[i];
        }
        i++;
      }
    } else if (parseHeredocStart(input, i)) {
      const { delim, next } = parseHeredocStart(input, i);
      pendingHeredocs.push(delim);
      endWord();
      i = next - 1;
    } else if (c === "\n") {
      endCommand();
      while (pendingHeredocs.length) {
        i = skipHeredocBody(input, i - 1, pendingHeredocs.shift()) - 1;
      }
    } else if (c === ";" || c === "|" || c === "&") {
      endCommand();
      if ((c === "&" || c === "|") && input[i + 1] === c) i++;
    } else if (c === " " || c === "\t") {
      endWord();
    } else {
      word += c;
      inWord = true;
    }
  }
  endCommand();
  return commands;
}

/** Drops leading `VAR=value` assignments. */
function normalize(words) {
  let i = 0;
  while (i < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i])) i++;
  return words.slice(i);
}

/** Value of a flag like `--base main`, `--base=main` or `-B main`; null if absent. */
function flagValue(words, longName, shortName) {
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w === longName || (shortName && w === shortName)) return words[i + 1] ?? "";
    if (w.startsWith(`${longName}=`)) return w.slice(longName.length + 1);
  }
  return null;
}

function checkPush(words, branch) {
  const args = words.slice(2);
  const flags = args.filter((a) => a.startsWith("-"));
  const positional = args.filter((a) => !a.startsWith("-"));

  if (flags.some((f) => f === "--force" || f === "-f")) {
    return "Force push blocked. Use --force-with-lease on your own feature branch; never force-push main/staging/development.";
  }

  // positional[0] is the remote; the rest are refspecs (src:dst, +src:dst, dst)
  const refspecs = positional.slice(1).map((r) => {
    const dst = r.replace(/^\+/, "").split(":").pop();
    return dst === "HEAD" ? branch : dst;
  });

  const deleting = flags.includes("--delete") || flags.includes("-d");
  const targets = refspecs.length ? refspecs : [branch];

  const hit = targets.find((t) => t && PROTECTED.has(t));
  if (hit) {
    return deleting
      ? `Deleting the protected branch "${hit}" is blocked.`
      : `Direct push to "${hit}" is blocked by Git Flow (feature/* -> development -> staging -> main). Push a feature/* branch and open a PR with --base development.`;
  }
  return null;
}

function checkPrCreate(words, branch) {
  const base = flagValue(words, "--base", "-B");
  const head = flagValue(words, "--head", "-H") ?? branch;

  if (!base) {
    return "`gh pr create` without --base is blocked: GitHub would default to main. Pass --base development (feature/*), --base staging (from development) or --base main (from staging).";
  }
  if (base === "main" && head !== "staging" && !String(head).startsWith("hotfix/")) {
    return `PRs to main must come from staging (or hotfix/*), not "${head}". Use --base development for features.`;
  }
  if (base === "staging" && head !== "development") {
    return `PRs to staging must come from development, not "${head}".`;
  }
  return null;
}

/**
 * @param {string} command  the Bash command about to run
 * @param {() => string} getBranch  returns the current git branch (called lazily)
 * @returns {string | null}  a message when the command must be blocked
 */
export function check(command, getBranch) {
  let branch = null;
  const currentBranch = () => (branch ??= getBranch());

  for (const raw of tokenize(command)) {
    const words = normalize(raw);
    const [tool, sub] = words;

    if (tool === "git" && (sub === "checkout" || sub === "switch")) {
      // Track branch changes inside a compound command. `git checkout -- <file>`
      // restores files and does not change the branch.
      if (!words.includes("--")) {
        const target = words.slice(2).find((w) => !w.startsWith("-"));
        if (target) branch = target;
      }
    } else if (tool === "git" && sub === "commit") {
      const b = currentBranch();
      if (PROTECTED.has(b)) {
        return `Committing directly on "${b}" is blocked by Git Flow. Create a feature/* branch from development first.`;
      }
    } else if (tool === "git" && sub === "push") {
      const message = checkPush(words, currentBranch());
      if (message) return message;
    } else if (tool === "gh" && sub === "pr" && words[2] === "create") {
      const message = checkPrCreate(words, currentBranch());
      if (message) return message;
    }
  }
  return null;
}

function readCurrentBranch() {
  try {
    return execFileSync("git", ["branch", "--show-current"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;

  let command = "";
  try {
    command = JSON.parse(raw)?.tool_input?.command ?? "";
  } catch {
    return; // never block on malformed input
  }
  if (!command) return;

  const message = check(command, readCurrentBranch);
  if (message) {
    console.error(`[git-flow-guard] ${message}`);
    process.exit(2);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
