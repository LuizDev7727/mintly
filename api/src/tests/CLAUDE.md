# Tests

## Stack

- **Vitest** — test runner
- **Supertest** — HTTP assertions against the Fastify server
- **better-auth `testUtils`** — helpers for creating users and generating auth headers in tests

## File conventions

- Route tests live in `src/tests/http/<resource>/<verb>-<resource>.test.ts` (e.g. `http/channel/create-channel.test.ts`, `http/project/get-projects.test.ts`); external `/api/v1/*` routes go in `http/external/`. Only cross-cutting tests such as `health.test.ts` sit directly in `src/tests/`.
- All test files follow the pattern `*.test.ts`, and the name reflects the route being tested.
- Test data comes from `src/tests/factories/` (see its `CLAUDE.md`). Factories must produce data the routes accept: a listed project needs a `runId`, and channel creation needs a `description`.

## Global setup (`setup.ts`)

`vitest.config.ts` runs `src/tests/setup.ts` before every test file. It:

1. Calls `server.ready()` so Fastify is fully initialized before assertions run
2. Creates a `testUser` and resolves `authHeaders` via `auth-test.ts`
3. Closes the server after all tests finish via `afterAll`

It also **mocks `generateRealtimeToken`** (`@/utils/generate-realtime-token.ts`) for every test. The real one calls Trigger.dev and needs `TRIGGER_SECRET_KEY`, which exists in a developer's `.env` but not in CI — without the mock, any list endpoint that returns an `ENCODING`/`PROCESSING` item answers 500 on CI while passing locally. Never call Trigger.dev or other paid/external services from a test.

Every test file boots the app and fetches its secrets from Infisical, which rate-limits (HTTP 429). `getInfisicalSecret` retries on 429, and `vitest.config.ts` limits workers to 2 when `CI` is set; if you add many test files, expect the run to take longer, not to fail.

Import these exports when your test needs an authenticated request:

```ts
import { testUser, authHeaders } from "@/tests/setup.ts";
```

## Writing a test

```ts
import { describe, test, expect } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";

describe("GET [/route]", () => {
  test("should return 200 OK", async () => {
    const response = await request(server.server).get("/api/route");

    expect(response.status).toEqual(200);
  });
});
```

- Use `server.server` (the underlying Node HTTP server) as the Supertest target — not the Fastify instance directly
- `describe` label format: `METHOD [/path]`
- `test` label format: `should <expected behavior>`

## Authenticated requests

Pass `authHeaders` from `setup.ts` as request headers:

```ts
import { describe, test, expect } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders } from "@/tests/setup.ts";

describe("GET [/protected-route]", () => {
  test("should return 200 for authenticated user", async () => {
    const response = await request(server.server)
      .get("/api/protected-route")
      .set(authHeaders);

    expect(response.status).toEqual(200);
  });
});
```

## Running tests

```bash
pnpm test
```
