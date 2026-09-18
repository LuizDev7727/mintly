---
name: mintly-review
description: Reviews the current branch's diff (or a PR number) against development with independent, parallel reviewers — tenant isolation, security, requirements, conventions, regression/hallucination, pipelines and billing, performance — and reports only findings backed by evidence, ranked blocker / should-fix / nit. Read-only; use before opening a PR or when asked to review a change.
---

# Mintly review

Review a change **without modifying anything**. Allowed commands are read-only (`git diff`, `git log`, `git show`, `gh pr view`, `gh pr diff`, reads and greps). Do not fix, commit, push or comment on a PR unless the user asks afterwards.

Read `CONTEXT.md` first (entities, pipelines, billing) — reviewers need the vocabulary.

## Step 0 — Scope and deterministic prefilter

Target = the PR number in the arguments (`gh pr diff <n>`), otherwise `git diff development...HEAD`.

```bash
git diff development...HEAD --stat
git diff development...HEAD --name-status | grep -E "^(D|R)"          # deleted / renamed files
git diff development...HEAD --name-status | grep -E "drizzle/migrations" # A = new (ok), M/D = existing (flag)
git diff development...HEAD --name-only | grep -E "(\.env|pnpm-lock|package\.json)"
git diff development...HEAD -U0 | grep -nE "^\+.*(Object\.assign\(new Error|console\.log|TODO|FIXME|process\.env)"
```

Record as **prefilter flags** (a flag is a lead for the reviewers, not a finding by itself):
- an **existing** migration modified or deleted (only *new* migration files are allowed — status `A`; `meta/_journal.json` is always `M` when a migration is added, that is expected)
- files outside the stated scope of the change (compare with the spec / PR description / user request)
- lockfile changed without a matching `package.json` change, or the reverse
- `.env*` touched
- a new ad-hoc `Object.assign(new Error…)` (must be a dedicated class in `src/errors/`, see `api/CLAUDE.md`)

If there is a spec (Given/When/Then, PR description, issue), keep it: reviewer 3 needs it.

## Step 1 — Independent reviewers (parallel, fresh context)

Start **one subagent per perspective in a single message** so they run in parallel. Each gets: the diff target, the prefilter flags, the path to `CONTEXT.md`, the spec if any, its perspective below, and these rules:

> Report only what you can prove: `file:line`, what is wrong, and a concrete input/state that produces the wrong result. If you find nothing for your perspective, answer exactly `NO ISSUES` — do not invent findings to look useful. Read the code around the diff, not only the changed lines. Read the `CLAUDE.md` of every folder you review.

1. **Tenant isolation & authorization** — Is every query scoped to the organization (`organizationSlug`)? A resource fetched by `channelId`/`projectId`/`postId` must be checked against the caller's organization — for the internal routes (`checkMembership`, `request.session`) and the external `/api/v1/*` routes (`request.organization`). Look for IDOR: can org A read or change org B's data by guessing an id? Missing `checkUserSession`/`checkApiKey` in `preHandler`.
2. **Security** — Secrets only via Infisical (`getInfisicalSecret`), never hardcoded or logged; raw `sql` fragments built from user input; unvalidated body/query/params (Zod inline); signed URLs and tokens (realtime tokens, webhook JWT `Mintly-Signature`); over-exposed response fields (e.g. `runId`, storage keys, tokens); CORS/cookie changes.
3. **Requirements & tests** — For every scenario/rule in the spec: the code that implements it **and** the test that covers it, or `MISSING`. Tests must assert behavior (status and body), include an error case, and — for tenant-scoped resources — a cross-organization case. Flag tests that can never fail.
4. **Conventions & architecture** — Compare with the `CLAUDE.md` of each touched folder (function anatomy `*Params`/`*Response`, route pattern, dedicated error classes registered in `error-handler.ts`, web component placement, `data-*` styling, `*.http.ts` naming, MSW mock registered). Flag any **new pattern, abstraction or dependency** that is not already in the codebase, even if it works.
5. **Regression & hallucination** — Files touched that are unrelated to the change; deleted files/tables/columns; edited migrations; behavior changed outside the stated scope. **Verify that every new import, function, option and API exists** in the installed version (`node_modules`) — invented APIs are the most common failure. Check the type-level lies (`as` casts, `!`, `any`) the diff introduces.
6. **Pipelines & billing** — Trigger.dev tasks must be safe to retry: no duplicated side effects, waitpoints/tokens handled, status written on every exit path (success, error, cancel). Polar usage events (`setUsage`): emitted exactly once per billable action, correct event name, real `_cost`, no double charge on retry, and never skipped on a billable path. Outbound webhooks: payload schema, union literal and publish point all updated (see `api/CLAUDE.md`).
7. **Performance** — N+1 queries, unbounded selects (no `limit`/pagination), sequential awaits that could be `Promise.all`, missing indexes for new filters, expensive work inside list endpoints (per-row signed URLs/tokens), unnecessary re-renders or refetch loops in the web (TanStack Query keys, effects).

## Step 2 — Consolidate and verify

1. Merge the reports and drop duplicates (same root cause = one finding).
2. **Drop every finding without evidence** (`file:line` + failure scenario).
3. For each **blocker**, re-read the cited code yourself before reporting it. If you cannot reproduce the reasoning, downgrade or drop it.
4. Do not blame the diff for what was already broken on `development`: compare with the base before attributing type/lint/test failures to the change.
5. If the user passes findings from a previous run, do not report those again unless they are still present — say which are resolved.

Severity:
- **blocker** — data leak or cross-tenant access, security hole, data loss, wrong billing, production crash, or a spec requirement not implemented.
- **should-fix** — real bug or convention break with limited impact, missing test for a rule, performance problem on a real path.
- **nit** — style or naming. Show at most 5, and none if there are blockers.

## Output

```
Verdict: SAFE TO MERGE | FIX BEFORE MERGE   (blockers: N, should-fix: N, nits: N)

Prefilter flags: <list or "none">

| # | Severity | Where (file:line) | Problem | Scenario that fails |
|---|----------|-------------------|---------|---------------------|

Perspectives with no issues: <list>
Not reviewed / not verifiable: <list — e.g. things that need a running stack>
```

Always state what you could not verify (for example, behavior that needs the running app or a real Trigger.dev run) instead of implying it was checked.
