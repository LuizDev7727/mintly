---
name: implement
description: Implements a full-stack change end-to-end — backend function, HTTP route, frontend HTTP call, UI, and tests — following all project conventions and Git Flow. Use for features, bug fixes, and UI changes alike.
---

You are implementing a full-stack change in the Mintly monorepo. Follow every step below in order. Do not skip steps. Read each referenced CLAUDE.md before writing any code in that layer.

---

## Step 0 — Understand what needs to be implemented

Before doing anything, ask the user:

> "O que você quer implementar? Descreva o que precisa ser feito — pode ser uma feature nova, um bug, uma mudança de UI, ou qualquer outra coisa."

Wait for the answer. From the description, identify:
- **What** is being built or changed (resource name, action, screen)
- **Why** — is it a new feature, a bug fix, or a UI change?
- **Which layers** are affected — does it need a new backend function and route, or is it purely frontend? Does it need a new UI screen or just a component change?

If the description is ambiguous, ask one follow-up question to clarify before proceeding. Do not assume scope — confirm it.

---

## Step 1 — Git Flow: create branch

Read `.claude/skills/git-flow/SKILL.md` and follow its rules exactly.

1. `git checkout development && git pull origin development`
2. Ask the user: **"What should the branch name be?"** — it will be prefixed as `feature/<name>`
3. `git checkout -b feature/<name>`

---

## Step 2 — Backend: business logic function

Read `api/src/functions/CLAUDE.md` before writing anything.

- Create the function file at `api/src/functions/<domain>/<verb>-<resource>.ts`
- Export exactly one function per file
- Define local `*Params` and `*Response` types
- Destructure `params` at the top of the function body
- Return typed data — never leak Drizzle internals
- Throw with `{ statusCode }` for expected error cases

---

## Step 3 — Backend: HTTP route

Read `api/src/infra/http/routes/CLAUDE.md` before writing anything.

- Create the route file at `api/src/infra/http/routes/<resource>/<verb>-<resource>.route.ts`
- Export a constant named `<verb><Resource>Route`
- Always include `preHandler: []` even if empty
- Validate all params, body, and response shapes with Zod inline
- Delegate all logic to the function from Step 2 — no business logic in the handler
- Register the route in `api/src/app.ts` via `server.register(...)`

---

## Step 4 — Backend: API test

Read `api/src/tests/CLAUDE.md` before writing anything.

- Create the test file at `api/src/tests/<resource>.test.ts`
- Use Supertest against `server.server`
- `describe` label format: `METHOD [/path]`
- `test` label format: `should <expected behavior>`
- For authenticated routes, import `authHeaders` from `@/tests/setup.ts`
- Cover the happy path and the most important error case (e.g. 401, 404)

---

## Step 5 — Frontend: HTTP function

Read `web/src/http/CLAUDE.md` before writing anything.

- Create the file at `web/src/http/<resource>/<verb>-<resource>.http.ts`
- Name the function `<verb><Resource>Http`
- Accept a single `params` object with a local type (never exported)
- Export the response type if the caller needs to reference it
- No `try/catch` — let errors propagate to TanStack Query

---

## Step 6 — Frontend: MSW mock

Read `web/src/http/mocks/CLAUDE.md` before writing anything.

- Create the mock file at `web/src/http/mocks/<verb>-<resource>-mock.ts`
- Export a constant named `<verb><Resource>Mock`
- Import `*Params`, `*Request`, and `*Response` types from the HTTP function created in Step 5
- Use `never` for generic positions that don't apply (no URL params, no body, no response)
- Register the new mock in `web/src/http/mocks/handlers.ts` — do not touch `index.ts`

---

## Step 8 — Frontend: UI

**Ask the user before writing any UI code:**

> "Where should the UI live?
> 1. Shared component — `web/src/components/<name>.tsx` (reused across pages)
> 2. Page-local component — inside the page folder as `<page>/-components/<name>.tsx` (used only in this page)"

Wait for the answer, then implement accordingly.

If the implementation requires creating a new page or route, read `web/src/pages/CLAUDE.md` before writing anything — every route must define `head()` with `title` and `description`.

---

## Step 9 — Frontend: tests

Decide which type of test makes sense based on what was built:

| What was built | Test type |
|---|---|
| Complete user flow (login, create, navigate) | E2E — `web/src/tests/e2e/<flow>.spec.ts` |
| UI component rendering / form validation | Unit — `web/src/tests/unit/<component>.spec.tsx` |
| Both a flow and isolated component logic | Both |

**For E2E:** read `web/src/tests/e2e/CLAUDE.md` — use Playwright, relative `page.goto()` paths, locator priority: `getByRole` → `getByLabel` → `getByText` → `getByTestId`.

**For unit:** use Vitest + React Testing Library. Import `render` and `screen` from `@testing-library/react`. No imports for `describe`/`test`/`expect` needed — globals are enabled.

---

## Step 10 — Git Flow: commit

Use Conventional Commits for every commit:

- `feat:` — new capability
- `fix:` — bug fix
- `chore:` — config, tooling, non-functional

Commit in logical units as work progresses (e.g. one commit per layer). Do not batch everything into a single commit.

---

## Checklist before finishing

- [ ] Scope confirmed with the user before starting
- [ ] Function file created and follows `*Params` / `*Response` pattern
- [ ] Route file created, registered in `app.ts`, and delegates to function
- [ ] API test covers happy path and a relevant error case
- [ ] Frontend HTTP function created with `Http` suffix
- [ ] MSW mock created and registered in `handlers.ts`
- [ ] UI component placed in the location the user chose
- [ ] Tests written (unit and/or e2e based on what makes sense)
- [ ] All commits follow Conventional Commits on a `feature/<name>` branch
