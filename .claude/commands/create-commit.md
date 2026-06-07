---
name: create-commit
description: Generate a Conventional Commit message based on current git changes and optionally execute the commit.
---

# Commit Command

You are responsible for generating a high-quality git commit message based on the current repository changes.

Follow the steps strictly.

---

## Step 1 — Detect Changes

1. First run:

   git diff --staged

2. If staged diff is empty, run:

   git diff

3. If no changes are found, inform the user:
   "No changes detected to commit."

---

## Step 2 — Analyze Changes

Analyze the diff carefully and determine:

- What changed?
- Why it changed?
- What is the impact?
- Is it a refactor, feature, fix, chore, docs, or style?
- Does it introduce a breaking change?

---

## Step 3 — Determine Commit Type

Use Conventional Commits specification:

- feat → new feature
- fix → bug fix
- refactor → code improvement without behavior change
- chore → maintenance
- docs → documentation only
- style → formatting only
- perf → performance improvement
- test → tests added or modified

If unsure, default to `chore`.

---

## Step 4 — Generate Commit Message

Follow EXACT format:

<type>(scope): short imperative summary under 72 characters

- bullet explaining main change
- bullet explaining reason
- bullet explaining impact (if relevant)

Rules:

- Use imperative mood (e.g., "add", "fix", "refactor")
- Do NOT use emojis
- Do NOT exceed 72 characters in the title
- Scope should reflect folder or feature name
- Be concise but meaningful
- If breaking change exists, add:

BREAKING CHANGE: description

---

## Step 6 — Output Mode

After generating the commit message (and diagram if applicable):

1. Show the full commit message clearly formatted.
2. Show the Mermaid diagram (if generated).
3. Ask the user:

"Do you want me to execute this commit?"

Only run:

git commit -m "<title>" -m "<body>"

If the user explicitly confirms.

Never auto-commit without confirmation.

---

## Quality Standards

- Do not generate generic messages like "update files"
- Be specific
- Mention affected domain (auth, organization, form, api, etc.)
- Detect patterns like schema changes, dependency updates, UI updates
- Detect refactors correctly

---

## Example Output

feat(organization): add create organization form

- implement React Hook Form with Zod validation
- enforce form-pattern skill architecture
- prepare component for tRPC mutation integration

---

If multiple logical changes are detected, suggest splitting into separate commits.
