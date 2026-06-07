# Tests

## Stack

- **Vitest** — test runner
- **Supertest** — HTTP assertions against the Fastify server
- **better-auth `testUtils`** — helpers for creating users and generating auth headers in tests

## File conventions

- All test files live in `src/tests/` and follow the pattern `*.test.ts`
- Test file names should reflect the route or module being tested (e.g. `health.test.ts`, `transactions.test.ts`)

## Global setup (`setup.ts`)

`vitest.config.ts` runs `src/tests/setup.ts` before every test file. It:

1. Calls `server.ready()` so Fastify is fully initialized before assertions run
2. Creates a `testUser` and resolves `authHeaders` via `auth-test.ts`
3. Closes the server after all tests finish via `afterAll`

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
