# E2E Tests

E2E tests validate complete user flows through the real browser — from navigation to interaction to final state. They are **not** for testing isolated components (use `src/tests/unit/` for that).

## Stack

- **Playwright** — browser automation and assertions
- Runs on **Chromium, Firefox, and WebKit** in parallel

## File conventions

- All E2E test files live in `src/tests/e2e/` and follow the pattern `*.spec.ts`
- Name files after the flow being tested, not a specific component (e.g. `auth.spec.ts`, `create-transaction.spec.ts`)

## How the server works

`playwright.config.ts` is configured with `webServer`, which:

1. Builds the app (`pnpm build`) and starts a preview server (`pnpm preview`) at `http://localhost:4173`
2. Sets `baseURL` to `http://localhost:4173` — use relative paths in all tests
3. Locally: reuses a running server if one exists; in CI: always starts a fresh one

The frontend calls the real API via `VITE_API_BASE_URL` (set in `.env`). For CI, set this variable to the staging API URL in the pipeline environment secrets — no mock, no local API needed.

```
# .env (local)
VITE_API_BASE_URL=http://localhost:3000/api

# CI environment variable
VITE_API_BASE_URL=https://api-staging.mintly.com/api
```

## Writing a test

```ts
import { test, expect } from "@playwright/test";

test("should complete signup and land on dashboard", async ({ page }) => {
  await page.goto("/sign-up");

  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
```

Always use relative paths in `page.goto()` — `baseURL` is resolved automatically.

## Grouping related flows

Use `test.describe` to group steps of the same feature:

```ts
import { test, expect } from "@playwright/test";

test.describe("Transactions", () => {
  test("should create a new transaction", async ({ page }) => { ... });
  test("should delete a transaction", async ({ page }) => { ... });
});
```

## Locator priority

Prefer locators in this order — more resilient to UI changes:

1. `getByRole` — semantic role (button, heading, textbox...)
2. `getByLabel` — form fields by their label
3. `getByText` — visible text
4. `getByTestId` — last resort, add `data-testid` only when nothing else works

## Running tests

```bash
# run all e2e tests (headless)
pnpm test

# run with browser UI visible
pnpm playwright test --headed

# open Playwright UI for debugging
pnpm playwright test --ui

# run a single file
pnpm playwright test src/tests/e2e/auth.spec.ts
```

## E2E vs Unit — when to use each

| Scenario | Where |
|---|---|
| User completes a full flow (login → create → view) | `e2e/` |
| A page navigates correctly after an action | `e2e/` |
| A component renders the right text given props | `unit/` |
| A form shows a validation error | `unit/` |
