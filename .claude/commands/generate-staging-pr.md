---
name: generate-staging-pr
description: Generates a pull request from develop to staging, with a full description of changes based on actual file diffs and a Mermaid diagram showing what was touched. Requires the GitHub CLI (gh) to be authenticated.
---

You are promoting changes from `develop` to `staging` for QA validation. Follow every step below in order.

---

## Step 1 — Analyze the actual file changes

Fetch and inspect what actually changed between `staging` and `develop`:

```bash
git fetch origin

# List every file that changed
git diff origin/staging..origin/develop --name-status

# Full diff to read what changed inside each file
git diff origin/staging..origin/develop
```

Read the full diff carefully. The PR description and diagram must reflect the **actual code changes**, not just commit messages. Commit messages are unreliable — the diff is the source of truth.

Also collect commits for grouping and linking:

```bash
git log origin/staging..origin/develop --pretty=format:"%h %s" --no-merges
git log origin/staging..origin/develop --merges --pretty=format:"%s"
```

---

## Step 2 — Understand what changed

From the diff, identify:

- **Which files were added, modified, or deleted** — use `--name-status` output
- **Which layers were touched** — backend function, HTTP route, frontend HTTP call, UI component, tests, config
- **What the change does at product level** — infer from reading the actual code, not just the commit subject
- **Whether there are new API endpoints**, new UI screens, changed behavior, or purely internal refactors

Group the findings by Conventional Commit type using the commit log:
- `feat:` → new features
- `fix:` → bug fixes
- `chore:` / `refactor:` / `docs:` / `test:` → maintenance

---

## Step 3 — Build the PR description

Compose the PR body using this structure:

```markdown
## Summary

<2-4 sentences describing what is being promoted, written at product level. Derived from reading the diff — not from rephrasing commit messages.>

## What's included

### Features
- <what it does, inferred from the diff> ([<short-hash>](link))

### Bug fixes
- <what was broken and what was fixed, inferred from the diff> ([<short-hash>](link))

### Maintenance
- <what was changed internally> ([<short-hash>](link))

## Files changed

| Layer | Files |
|---|---|
| Backend functions | `api/src/functions/...` |
| HTTP routes | `api/src/infra/http/routes/...` |
| Frontend HTTP | `web/src/http/...` |
| UI components | `web/src/components/...` or `web/src/routes/...` |
| Tests | `api/src/tests/...`, `web/src/tests/...` |

<Only include rows for layers that actually have changes.>

## Flow diagram

<Mermaid diagram — always required, see Step 4>
```

---

## Step 4 — Mermaid diagram

The diagram is **always required**. Choose the type based on what the diff shows:

### Option A — `flowchart` (when the diff touches multiple layers end-to-end)

Use when the change spans frontend → API → database. Build the nodes from the **actual file names and function names** found in the diff:

```
flowchart LR
    A[User] --> B[TransactionForm]
    B --> C[createTransactionHttp]
    C --> D[POST /api/transactions]
    D --> E[createTransaction]
    E --> F[(transactions table)]
```

### Option B — `sequenceDiagram` (when the change involves a multi-step interaction or async flow)

Use when the diff shows a request/response flow, auth sequence, webhook, or background task:

```
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant DB

    User->>Frontend: submits form
    Frontend->>API: POST /api/transactions
    API->>DB: insert transaction
    DB-->>API: transaction id
    API-->>Frontend: 201 { transactionId }
    Frontend-->>User: success toast
```

### Option C — `gitGraph` (when multiple independent features were merged)

Use when the diff contains several unrelated features merged from different feature branches:

```
gitGraph
   commit id: "staging baseline"
   branch develop
   branch feature/transactions
   checkout feature/transactions
   commit id: "feat: transaction list"
   checkout develop
   merge feature/transactions
   branch feature/auth
   checkout feature/auth
   commit id: "fix: token refresh"
   checkout develop
   merge feature/auth
```

**Pick based on the diff:**
- Single end-to-end feature → `flowchart`
- Auth, async, or multi-step flow → `sequenceDiagram`
- Multiple unrelated features → `gitGraph`

Always use **real names from the diff** (component names, function names, route paths) — never generic placeholders.

---

## Step 5 — Create the pull request

```bash
gh pr create \
  --base staging \
  --head develop \
  --title "staging: promote develop — <short summary>" \
  --body "$(cat <<'EOF'
<full PR body from Step 3>
EOF
)"
```

If a PR from `develop` → `staging` already exists, update its body instead:

```bash
gh pr edit <pr-number> --body "$(cat <<'EOF'
<full PR body>
EOF
)"
```

---

## Step 6 — Report back

After the PR is created, report:

```
Staging PR:       <pr url>
Files changed:    <count>
Commits included: <count>
Features:         <count>
Bug fixes:        <count>
```
