---
name: generate-release-pr
description: Generates a release pull request from staging to main, with a full description of changes, optional Mermaid diagram, and a GitHub release with release notes. Requires the GitHub CLI (gh) to be authenticated.
---

You are generating a production release for the Mintly project. Follow every step below in order.

---

## Step 1 — Collect commits and determine version

Get all commits that are in `staging` but not yet in `main`:

```bash
git fetch origin
git log origin/main..origin/staging --pretty=format:"%h %s" --no-merges
```

Group the commits by Conventional Commit type:
- `feat:` → new features (bumps **minor** version)
- `fix:` → bug fixes (bumps **patch** version)
- `chore:` / `refactor:` / `docs:` / `test:` → maintenance (bumps **patch** version)
- `feat!:` or `BREAKING CHANGE` in footer → breaking change (bumps **major** version)

Then read the current version from `package.json` at the repo root (or from `api/package.json` if no root one exists):

```bash
cat package.json | grep '"version"'
```

Calculate the next SemVer version based on the highest-impact commit type found:
- Any `feat:` → increment minor, reset patch → `x.(y+1).0`
- Only `fix:` / `chore:` → increment patch → `x.y.(z+1)`
- Any breaking → increment major → `(x+1).0.0`

---

## Step 2 — Build the PR description

Compose the PR body using this structure:

```markdown
## Summary

<2-4 sentences describing what this release brings at a product level — not a list of commits, but a human-readable summary of the impact.>

## What's changed

### Features
- <commit subject> ([<short-hash>](link))

### Bug fixes
- <commit subject> ([<short-hash>](link))

### Maintenance
- <commit subject> ([<short-hash>](link))

## Flow diagram

<include a Mermaid diagram here ONLY if the release contains more than one feature or crosses multiple domains. If the release is a single fix or chore, omit this section entirely.>
```

### Mermaid diagram guidelines

Use a `gitGraph` diagram to show which feature branches were merged into staging for this release:

```
gitGraph
   commit id: "main baseline"
   branch staging
   branch feature/transaction-list
   checkout feature/transaction-list
   commit id: "feat: add transaction list"
   checkout staging
   merge feature/transaction-list
   branch feature/auth-refresh
   checkout feature/auth-refresh
   commit id: "fix: refresh token expiry"
   checkout staging
   merge feature/auth-refresh
```

If a `gitGraph` doesn't fit (e.g., the release is purely backend or UI changes with no branching story), use a `flowchart` to show what was affected:

```
flowchart LR
    A[User] --> B[Sign-in page]
    B --> C[Auth API]
    C --> D[(Database)]
```

Only include the diagram if it genuinely adds clarity. A diagram for a single-line fix adds no value — omit it.

---

## Step 3 — Create the pull request

```bash
gh pr create \
  --base main \
  --head staging \
  --title "release: v<version>" \
  --body "$(cat <<'EOF'
<full PR body from Step 2>
EOF
)"
```

If a PR from `staging` → `main` already exists, update its body instead:

```bash
gh pr edit <pr-number> --body "$(cat <<'EOF'
<full PR body>
EOF
)"
```

---

## Step 4 — Create the GitHub release

After the PR is created (not merged — create the release draft now so it is ready):

```bash
gh release create "v<version>" \
  --target staging \
  --title "v<version>" \
  --notes "$(cat <<'EOF'
## What's changed

### Features
- <item>

### Bug fixes
- <item>

### Maintenance
- <item>

**Full changelog**: https://github.com/<owner>/<repo>/compare/v<previous-version>...v<version>
EOF
)" \
  --draft
```

Create the release as a **draft** (`--draft`). It will be published when the PR is merged and the deploy succeeds.

---

## Step 5 — Report back

After both the PR and the draft release are created, report:

```
Release PR:      <pr url>
Draft release:   <release url>
Version:         v<version>
Commits included: <count>
```

---

## Checklist

- [ ] Commits collected from `origin/staging` excluding `origin/main`
- [ ] Next SemVer version determined from commit types
- [ ] PR body has a human-readable summary, grouped changelog, and diagram (if warranted)
- [ ] PR created targeting `main` with title `release: v<version>`
- [ ] Draft GitHub release created with the same release notes
