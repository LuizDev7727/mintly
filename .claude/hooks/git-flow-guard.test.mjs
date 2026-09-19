// Run with: node --test .claude/hooks/git-flow-guard.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { check, tokenize } from "./git-flow-guard.mjs";

const blocked = (command, branch) => {
  const message = check(command, () => branch);
  assert.ok(message, `expected to BLOCK on "${branch}": ${command}`);
};
const allowed = (command, branch) => {
  const message = check(command, () => branch);
  assert.equal(message, null, `expected to ALLOW on "${branch}": ${command}\n  got: ${message}`);
};

test("git commit is blocked only on protected branches", () => {
  for (const b of ["main", "staging", "development"]) {
    blocked('git commit -m "x"', b);
    blocked("git commit --amend --no-edit", b);
  }
  allowed('git commit -m "x"', "feature/x");
  allowed('git add . && git commit -m "x"', "feature/x");
});

test("git commit is checked against a branch switched to in the same command", () => {
  blocked('git checkout development && git commit -m "x"', "feature/x");
  allowed('git checkout -b feature/y && git commit -m "x"', "development");
  allowed('git checkout -- file.ts && git commit -m "x"', "feature/x");
});

test("git push to protected branches is blocked", () => {
  blocked("git push", "main");
  blocked("git push origin", "development");
  blocked("git push origin main", "feature/x");
  blocked("git push origin HEAD", "staging");
  blocked("git push origin feature/x:development", "feature/x");
  blocked("git push origin --delete main", "feature/x");
});

test("git push of feature branches is allowed", () => {
  allowed("git push", "feature/x");
  allowed("git push -u origin feature/x", "feature/x");
  allowed("git push origin HEAD", "feature/x");
  allowed("git push origin --delete feature/x", "development");
  allowed("git push --force-with-lease origin feature/x", "feature/x");
});

test("force push is blocked", () => {
  blocked("git push --force origin feature/x", "feature/x");
  blocked("git push -f", "feature/x");
});

test("gh pr create requires a valid --base", () => {
  blocked('gh pr create --title "x"', "feature/x");
  blocked("gh pr create --base main", "feature/x");
  blocked("gh pr create --base staging", "feature/x");
  allowed("gh pr create --base development", "feature/x");
  allowed("gh pr create --base=development --title x", "feature/x");
  allowed("gh pr create -B development", "feature/x");
  allowed("gh pr create --base staging --head development", "feature/x");
  allowed("gh pr create --base main --head staging", "feature/x");
  allowed("gh pr create --base main", "staging");
  allowed("gh pr create --base main", "hotfix/urgent");
});

test("text inside quotes, heredocs and $(...) never triggers a rule", () => {
  allowed('git commit -m "docs: mention git push origin main and gh pr create"', "feature/x");
  allowed("echo 'git push origin main' && git status", "feature/x");
  allowed("git commit -F - <<'EOF'\nfix: never run git push origin main\n\ngh pr create\nEOF", "feature/x");
  allowed("git log --oneline | grep 'git push'", "development");
});

test("real-world: gh pr create with a heredoc body containing quotes and git commands", () => {
  const command = [
    'gh pr create --base development --head feature/x --title "ci: x" --body "$(cat <<\'EOF\'',
    '## Summary',
    'Reverted because a "full run" fails. Do not `git push origin main`.',
    '- run `gh pr create` without "--base" is blocked',
    "EOF",
    ')" 2>&1 | tail -2',
  ].join("\n");
  allowed(command, "feature/x");
  blocked(command.replace("--base development", ""), "feature/x");
});

test("real-world: commit then push in one command on a feature branch", () => {
  const command = [
    "git add a.ts && git commit -q -F - <<'EOF'",
    "fix(api): x",
    "",
    "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>",
    "EOF",
    "git push -q origin feature/x 2>&1 | tail -1",
  ].join("\n");
  allowed(command, "feature/x");
  blocked(command, "development");
});

test("real-world: the project's own release and staging PR commands are allowed", () => {
  const release = [
    "gh pr create \\",
    "  --base main \\",
    "  --head staging \\",
    '  --title "release: v1.2.0" \\',
    "  --body \"$(cat <<'EOF'",
    "## Release",
    "- merges development into staging",
    "EOF",
    ')"',
  ].join("\n");
  const staging = release
    .replace("--base main", "--base staging")
    .replace("--head staging", "--head development")
    .replace("release: v1.2.0", "staging: promote development");

  allowed(release, "staging");
  allowed(staging, "development");
  // a misspelled head (the old skill said "develop") must be caught
  blocked(staging.replace("--head development", "--head develop"), "development");
});

test("env assignments before the command are ignored", () => {
  blocked("GIT_TERMINAL_PROMPT=0 git push origin main", "feature/x");
});

test("tokenize splits on &&, ||, ; and |", () => {
  assert.deepEqual(tokenize("a b && c; d | e || f"), [["a", "b"], ["c"], ["d"], ["e"], ["f"]]);
  assert.deepEqual(tokenize('git commit -m "a b"'), [["git", "commit", "-m", "a b"]]);
});
