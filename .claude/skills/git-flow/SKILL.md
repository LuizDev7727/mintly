---
name: git-flow
description: Follows Git Flow branching conventions — branch naming, commit types, and merge direction. Does not install or configure any git-flow tooling.
---

# Git Flow Conventions

Follow these branching conventions. Do not install or configure any git-flow tool — just apply the patterns manually.

## Branch Structure

This project uses three permanent branches instead of the traditional two:

```
main ← staging ← development ← feature/*
                              ← hotfix/*
```

* **main**: Production-ready code only. Never commit or push directly.
* **staging**: Pre-production validation. Receives PRs from `development`. Never commit directly.
* **development**: Main integration branch. All feature branches spawn from here.
* **feature/**: Prefixed as `feature/<name>`. Always branch from `development`.
* **hotfix/**: Prefixed as `hotfix/<name>`. Branch from `main` for emergency fixes only — merge back into both `main` and `development`.

## Feature Lifecycle

1. Update local `development`: `git checkout development && git pull origin development`
2. Create the branch: `git checkout -b feature/<name>`
3. Commit using Conventional Commits as work progresses
4. Open a PR targeting `development` when done

## Merge Flow

```
feature/<name>  →  development  →  staging  →  main
```

- Features are merged into `development` via PR
- `development` is promoted to `staging` via PR (use `/generate-staging-pr`)
- `staging` is promoted to `main` via release PR (use `/generate-release-pr`)

## Hotfix Lifecycle

Only for emergency fixes in production:

1. Branch from `main`: `git checkout -b hotfix/<name> main`
2. Fix, commit, then open PRs targeting **both** `main` and `development`

## Commit Convention

Use Conventional Commits on every commit:

| Prefix | When to use |
|---|---|
| `feat:` | New capability visible to the user |
| `fix:` | Bug fix |
| `chore:` | Config, tooling, deps, non-functional changes |
| `refactor:` | Internal restructuring, no behavior change |
| `test:` | Adding or updating tests |
| `docs:` | Documentation only |

Breaking changes: append `!` after the type — `feat!:` or `fix!:` — and add a `BREAKING CHANGE:` footer.
