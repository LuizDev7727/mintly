---
name: sync-branches
description: Syncs the local `main` and `staging` branches with the remote (origin) via fast-forward pull, then returns to whatever branch you started on.
---

# Sync Branches Command

You are syncing the local `main` and `staging` branches with `origin`, without touching any other branch or losing uncommitted work. Follow every step below in order.

---

## Step 1 — Check for uncommitted changes

```bash
git status --short
```

If there are any uncommitted changes (staged or unstaged), **stop and inform the user**:

"Você tem alterações não commitadas. Commit, stash ou descarte-as antes de sincronizar as branches."

Do not stash automatically — the user decides what to do with in-progress work. Only proceed once the working tree is clean.

---

## Step 2 — Remember the current branch

```bash
git branch --show-current
```

Save this branch name — you will switch back to it at the end, whether or not it's `main` or `staging`.

---

## Step 3 — Fetch the remote

```bash
git fetch origin
```

---

## Step 4 — Sync each branch

For each branch in `main` and `staging` (in that order):

```bash
git checkout <branch>
git pull --ff-only origin <branch>
```

Rules:
- Always use `--ff-only`. Never merge, rebase, or force-update — if the local branch has diverged from `origin/<branch>` (i.e. fast-forward is not possible), **stop immediately**, report which branch diverged, and do not touch it further. This should not normally happen for `main`/`staging` in this repo's Git Flow, so a divergence is worth flagging loudly rather than silently resolving.
- If a local branch doesn't exist yet (e.g. first time on this machine), use `git checkout -b <branch> origin/<branch>` instead of plain `checkout` + `pull`.
- If checkout of a branch fails for any other reason, report the error and move on to the next branch rather than aborting the whole sync.

---

## Step 5 — Return to the original branch

```bash
git checkout <branch-from-step-2>
```

---

## Step 6 — Report back

Report a concise summary, e.g.:

```
main:    up to date (no new commits) | fast-forwarded N commits | DIVERGED — needs manual resolution
staging: up to date (no new commits) | fast-forwarded N commits | DIVERGED — needs manual resolution

Back on: <original branch>
```
