---
name: cleanup-branch
description: After a PR is merged, switches back to its base branch, pulls the merge, and deletes the feature branch both locally and on origin.
---

# Cleanup Branch Command

You are cleaning up a feature branch after its pull request has already been merged. Follow every step below in order. Never delete a branch whose PR is not confirmed merged.

Arguments: `$ARGUMENTS` — optional branch name to clean up. If omitted, use the current branch (`git branch --show-current`).

---

## Step 1 — Determine the branch to clean up

```bash
git branch --show-current
```

Use `$ARGUMENTS` if provided, otherwise the current branch.

If the resolved branch is `main`, `staging`, or `development`, **stop immediately** and inform the user:

"`<branch>` é uma branch protegida do Git Flow — não posso deletá-la."

---

## Step 2 — Check for uncommitted changes

```bash
git status --short
```

If there are any uncommitted changes (staged or unstaged), **stop and inform the user**:

"Você tem alterações não commitadas em `<branch>`. Commit, stash ou descarte-as antes de eu continuar."

Do not stash automatically. Only proceed once the working tree is clean.

---

## Step 3 — Confirm the PR is merged and find its base branch

```bash
gh pr list --head <branch> --state merged --json number,baseRefName,mergedAt,url --limit 1
```

- If this returns a merged PR, extract `baseRefName` — that is the branch to switch back to.
- If it returns nothing, check for an open PR instead:
  ```bash
  gh pr list --head <branch> --state open --json number,url --limit 1
  ```
  - If an open PR exists, **stop** and tell the user it hasn't been merged yet (include the PR URL). Do not delete anything.
  - If no PR exists at all (open or merged), **stop** and ask the user to confirm the base branch and merge status manually before proceeding — do not guess.

---

## Step 4 — Switch to the base branch and pull

```bash
git fetch origin
git checkout <baseRefName>
git pull origin <baseRefName>
```

Confirm the merge commit for the PR found in Step 3 is now present in the log (`git log --oneline -5`) before continuing.

---

## Step 5 — Delete the branch locally

```bash
git branch -d <branch>
```

- `-d` (safe delete) refuses if the branch isn't fully merged into the current HEAD — that's expected and safe for a normal merge-commit workflow.
- If it refuses specifically because of a squash/rebase merge (the content is merged on GitHub per Step 3, but git doesn't recognize it as an ancestor), it's safe to force it since the PR API already confirmed the merge:
  ```bash
  git branch -D <branch>
  ```
- If `-d` fails for any other reason, stop and report the error instead of forcing.

---

## Step 6 — Delete the branch on origin

```bash
git ls-remote --heads origin <branch>
```

- If the branch still exists remotely, delete it:
  ```bash
  git push origin --delete <branch>
  ```
- If it no longer exists (GitHub often auto-deletes the head branch on merge), skip this and note it in the report.

---

## Step 7 — Report back

```
Branch:      <branch> (deleted locally + remotely | deleted locally, already gone remotely)
Merged into: <baseRefName>
PR:          <pr url>
Now on:      <baseRefName>, up to date with origin
```
