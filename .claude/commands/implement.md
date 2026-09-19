---
name: implement
description: Implements a full-stack change end-to-end — spec, backend function, HTTP route, frontend HTTP call, UI, tests — then proves it against the spec with an independent verifier, following all project conventions and Git Flow. Use for features, bug fixes, and UI changes alike.
---

You are implementing a full-stack change in the Mintly monorepo. Follow every step below in order. Do not skip steps. Read each referenced CLAUDE.md before writing any code in that layer.

The flow is always: **discover → spec → implement → verify**. The agent that implements must not be the one that declares the work done — Step 12 uses a fresh subagent for that.

---

## Step 0 — Discover

Ask the user:

> "O que você quer implementar? Descreva o que precisa ser feito — pode ser uma feature nova, um bug, uma mudança de UI, ou qualquer outra coisa."

Wait for the answer. From the description, identify:
- **What** is being built or changed (resource name, action, screen)
- **Why** — new feature, bug fix, or UI change
- **Which layers** are affected — backend function + route, Trigger.dev task, frontend HTTP call, UI, or only a subset

Then read the code that will be touched (use an Explore subagent for wide sweeps so the main context stays small).

Resolve ambiguity by asking **one question at a time** — later questions often depend on earlier answers. For each question, state your recommended answer so the user can reply "faça o recomendado". Do not assume scope — confirm it.

---

## Step 1 — Spec

Write a short spec in the conversation (do not commit it) and get the user's OK before touching code:

- **Scope** — what is in, and what is explicitly out
- **Domain rules** — including multi-tenant rules (every query is scoped to the organization) and billing impact (Polar usage events) when relevant
- **Scenarios** — Given / When / Then, at least the happy path and the main error case per rule
- **Technical decisions** — files to create/change, new tables or migrations, whether a Trigger.dev task or outbound webhook event is involved

Keep it proportional: a one-field UI tweak needs three lines, not a document. This spec is the contract that Step 12 verifies against.

---

## Step 2 — Git Flow: create branch

Read `.claude/skills/git-flow/SKILL.md` and follow its rules exactly.

1. `git checkout development && git pull origin development`
2. Ask the user: **"What should the branch name be?"** — it will be prefixed as `feature/<name>`
3. `git checkout -b feature/<name> && git push -u origin feature/<name>` — always push immediately, never leave the branch local-only

---

## Step 3 — Backend: business logic function

Read `api/src/functions/CLAUDE.md` before writing anything.

- Create the function file at `api/src/functions/<domain>/<verb>-<resource>.ts`
- Export exactly one function per file
- Define local `*Params` and `*Response` types
- Destructure `params` at the top of the function body
- Return typed data — never leak Drizzle internals
- Scope every query to the organization/channel of the caller
- For expected error cases, throw a dedicated error class from `src/errors/<name>.error.ts` and register it in `src/infra/http/routes/error-handler.ts` (see `api/CLAUDE.md`, section "Erros"). Never throw a plain `Error` or attach an ad-hoc `statusCode`
- Schema change → edit the table in `src/infra/db/tables/` and generate the migration with `pnpm db:generate`; never hand-edit files in `drizzle/migrations/`

---

## Step 4 — Backend: HTTP route

Read `api/src/infra/http/routes/CLAUDE.md` before writing anything.

- Create the route file at `api/src/infra/http/routes/<resource>/<verb>-<resource>.route.ts`
- Export a constant named `<verb><Resource>Route`
- Always include `preHandler: []` even if empty
- Validate all params, body, and response shapes with Zod inline
- Delegate all logic to the function from Step 3 — no business logic in the handler
- Register the route in `api/src/app.ts` via `server.register(...)`

---

## Step 5 — Backend: Trigger.dev task and outbound webhook (only if the spec calls for them)

- **Async pipeline work** (video, transcription, clips, publishing): read `api/src/infra/trigger/CLAUDE.md` before writing anything. Tasks must be safe to retry — no duplicated side effects, and no duplicated Polar usage events on a retry.
- **New outbound webhook event**: follow the "Webhooks de saída" section of `api/CLAUDE.md` (payload schema, union literal, publish point) and update the public docs in `docs/`.

Skip this step entirely when the spec has neither.

---

## Step 6 — Backend: API test

Read `api/src/tests/CLAUDE.md` before writing anything.

- Create the test file at `api/src/tests/<resource>.test.ts`
- Use Supertest against `server.server`
- `describe` label format: `METHOD [/path]`
- `test` label format: `should <expected behavior>`
- For authenticated routes, import `authHeaders` from `@/tests/setup.ts`
- Cover the happy path and the most important error case (e.g. 401, 404) — and, for tenant-scoped resources, a request from another organization must not see the data

---

## Step 7 — Frontend: HTTP function

Read `web/src/http/CLAUDE.md` before writing anything.

- Create the file at `web/src/http/<resource>/<verb>-<resource>.http.ts`
- Name the function `<verb><Resource>Http`
- Accept a single `params` object with a local type (never exported)
- Export the response type if the caller needs to reference it
- No `try/catch` — let errors propagate to TanStack Query

---

## Step 8 — Frontend: MSW mock

Read `web/src/http/mocks/CLAUDE.md` before writing anything.

- Create the mock file at `web/src/http/mocks/<verb>-<resource>-mock.ts`
- Export a constant named `<verb><Resource>Mock`
- Import `*Params`, `*Request`, and `*Response` types from the HTTP function created in Step 7
- Use `never` for generic positions that don't apply (no URL params, no body, no response)
- Register the new mock in `web/src/http/mocks/handlers.ts` — do not touch `index.ts`

---

## Step 9 — Frontend: UI

**Ask the user before writing any UI code:**

> "Where should the UI live?
> 1. Shared component — `web/src/components/<name>.tsx` (reused across pages)
> 2. Page-local component — inside the page folder as `<page>/-components/<name>.tsx` (used only in this page)"

Wait for the answer, then implement accordingly. Read `web/CLAUDE.md` first (component placement, `data-*` attributes instead of className ternaries).

If the implementation requires creating a new page or route, read `web/src/pages/CLAUDE.md` before writing anything — every route must define `head()` with `title` and `description`.

---

## Step 10 — Frontend: tests

Decide which type of test makes sense based on what was built:

| What was built | Test type |
|---|---|
| Complete user flow (login, create, navigate) | E2E — `web/src/tests/e2e/<flow>.spec.ts` |
| UI component rendering / form validation | Unit — `web/src/tests/unit/<component>.spec.tsx` |
| Both a flow and isolated component logic | Both |

**For E2E:** read `web/src/tests/e2e/CLAUDE.md` — use Playwright, relative `page.goto()` paths, locator priority: `getByRole` → `getByLabel` → `getByText` → `getByTestId`.

**For unit:** use Vitest + React Testing Library. Import `render` and `screen` from `@testing-library/react`. No imports for `describe`/`test`/`expect` needed — globals are enabled.

---

## Step 11 — Run the gates

Run only the gates for the layers you touched, and fix every failure **your change caused** before moving on. Report the real exit code and output — never claim a gate passed without running it, and never infer it from empty output (check the exit code, not the last line of a pipe).

| Layer | Command (from the project folder) |
|---|---|
| `api/` typecheck | `pnpm typecheck` (30–120s) — the baseline is clean and CI blocks on it, so any error is yours |
| `api/` tests | `pnpm test <changed test files>` — needs Postgres from `docker-compose.yml` (port 5483) with migrations applied (`pnpm db:migrate`) |
| `web/` lint | `pnpm exec eslint <changed files>` — `pnpm lint` on the whole repo still fails on legacy errors |
| `web/` typecheck + build | `pnpm build` |
| `web/` unit tests | `pnpm test:unit` |
| `web/` e2e (when a flow was added/changed) | `pnpm test <changed spec files>` |

**Known baseline failure.** Only `pnpm lint` in `web/` still has legacy errors. Do not "fix" unrelated files to make it green: lint just the files you changed, confirm your change adds **no new** errors, and report the pre-existing ones separately. The `api/` typecheck, the web typecheck and the web unit tests are clean — a failure there is caused by your change. Delete this paragraph once `pnpm lint` is clean.

If the change touches a screen and a Playwright MCP server is available, open the page in the browser and exercise the new behavior once — the automated tests do not replace seeing it work.

---

## Step 12 — Verify against the spec (independent subagent)

Start a **fresh subagent** (general-purpose) with a clean context. Give it the spec from Step 1 verbatim and tell it that its job is to **prove** each scenario is implemented and covered, not to be agreeable. It must:

1. For every Given/When/Then and domain rule: point to the code (`file:line`) and the test that covers it, or mark it **MISSING**
2. Check the diff (`git diff development...HEAD --stat`) for files unrelated to the spec — deleted files, edited migrations, changed tables outside scope
3. Check multi-tenant scoping and error handling against `api/CLAUDE.md`, and the layer conventions against the CLAUDE.md files read above
4. Report **PASS / FAIL per criterion**, with evidence

If any criterion fails, fix it and run the verifier again. Stop after two rounds and hand the remaining failures to the user instead of looping.

---

## Step 13 — Git Flow: commit

Use Conventional Commits for every commit:

- `feat:` — new capability
- `fix:` — bug fix
- `chore:` — config, tooling, non-functional
- `refactor:` / `test:` / `docs:` — see `.claude/skills/git-flow/SKILL.md`

Commit in logical units as work progresses (e.g. one commit per layer). Do not batch everything into a single commit. Push after committing.

---

## Checklist before finishing

- [ ] Scope confirmed with the user and spec approved before any code
- [ ] Branch created from `development` and pushed with `-u`
- [ ] Function file created, follows `*Params` / `*Response`, scoped to the organization, uses a dedicated error class
- [ ] Route file created, registered in `app.ts`, and delegates to function
- [ ] Trigger.dev task / webhook event handled (or explicitly not needed)
- [ ] API test covers happy path, a relevant error case, and tenant isolation
- [ ] Frontend HTTP function created with `Http` suffix
- [ ] MSW mock created and registered in `handlers.ts`
- [ ] UI component placed in the location the user chose
- [ ] Tests written (unit and/or e2e based on what makes sense)
- [ ] Gates from Step 11 ran and passed (real output, not assumed)
- [ ] Verifier subagent from Step 12 returned PASS on every criterion
- [ ] All commits follow Conventional Commits on a `feature/<name>` branch
