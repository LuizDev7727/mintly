# HTTP Routes Pattern

## Overview

Routes are implemented using **Fastify** with **Zod** validation via `fastify-type-provider-zod`. Each route is a standalone plugin registered in `src/app.ts`.

---

## Directory Structure

Each resource has its own folder under `src/infra/http/routes/`:

```
src/
├── app.ts                          # Route registration
├── infra/
│   └── http/
│       └── routes/
│           └── <resource>/
│               ├── create-<resource>.route.ts
│               ├── get-<resource>s.route.ts
│               ├── update-<resource>.route.ts
│               └── delete-<resource>.route.ts
└── functions/
    └── <resource>/
        ├── create-<resource>.ts
        ├── get-<resource>s.ts
        ├── update-<resource>.ts
        └── delete-<resource>.ts
```

---

## Route File Pattern

### File naming

```
<action>-<resource>.route.ts
```

Examples: `create-post.route.ts`, `get-posts.route.ts`, `delete-post.route.ts`

### Route structure

```typescript
import { doSomething } from "@/functions/<resource>/do-something";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const doSomethingRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/resource/:id",
    {
      preHandler: [],
      schema: {
        params: z.object({
          id: z.uuid(),
        }),
        body: z.object({
          name: z.string(),
        }),
        response: {
          201: z.object({
            resourceId: z.uuidv7(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name } = request.body;

      const { resourceId } = await doSomething({ id, name });

      return reply.status(201).send({ resourceId });
    },
  );
};
```

### Rules

- The exported constant must be named `<action><Resource>Route` (camelCase).
- Always declare `preHandler: []` even if no middleware is used — it serves as a placeholder for future auth/guards.
- All params, body, and response shapes must be validated with Zod inline inside `schema`.
- The handler is always `async (request, reply)` and delegates business logic to a function imported from `src/functions/`.
- Never put business logic inside the route handler itself.

---

## Tracing

`FastifyOtelInstrumentation` (configured in `src/infra/http/instrumentation.ts`) automatically creates a span for every HTTP request. Use the custom tracer from `src/infra/http/tracer/tracer.ts` to wrap the business logic call in a named child span — this makes it possible to distinguish handler overhead from function execution time in traces.

### Pattern

```typescript
import { trace } from "@opentelemetry/api";
import { tracer } from "@/infra/http/tracer/tracer";
import { doSomething } from "@/functions/<resource>/do-something";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const doSomethingRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/resource/:id",
    {
      preHandler: [],
      schema: {
        params: z.object({ id: z.uuid() }),
        body: z.object({ name: z.string() }),
        response: {
          201: z.object({ resourceId: z.uuidv7() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name } = request.body;

      const span = tracer.startSpan("doSomething");
      span.setAttribute("resource.id", id);

      const { resourceId } = await doSomething({ id, name });

      span.end();

      trace.getActiveSpan()?.setAttribute("resource_id", resourceId);

      return reply.status(201).send({ resourceId });
    },
  );
};
```

### Span naming

Use the function name being called as the span name:

```typescript
const span = tracer.startSpan("createTransaction");
const span = tracer.startSpan("getTransactions");
```

### Two levels of attributes

- **`span.setAttribute`** — atributos do span customizado (inputs da operação, IDs relevantes)
- **`trace.getActiveSpan()?.setAttribute`** — atributos no span HTTP pai gerado automaticamente pelo Fastify (outputs, IDs gerados durante o handler)

### Rules

- Always call `span.end()` after the work is done — spans that are never ended are lost.
- Use `span.setAttribute` for inputs/context known before the operation.
- Use `trace.getActiveSpan()?.setAttribute` for outputs or IDs generated during the handler.

---

## HTTP Methods and Status Codes

| Action   | Method   | Status |
|----------|----------|--------|
| Create   | `POST`   | `201`  |
| Read     | `GET`    | `200`  |
| Update   | `PUT`    | `200` or `204` |
| Delete   | `DELETE` | `204`  |

---

## Function Layer Pattern

Each route delegates to a function in `src/functions/<resource>/`:

```typescript
type CreateResourceParams = {
  orgSlug: string;
  name: string;
};

type CreateResourceResponse = {
  resourceId: string;
};

export async function createResource(
  params: CreateResourceParams,
): Promise<CreateResourceResponse> {
  // business logic here
  return { resourceId: "" };
}
```

### Rules

- Use explicit `Params` and `Response` types — no inline typing.
- The function must have a single parameter object (never multiple positional args).
- The return type must always be explicit and wrapped in `Promise<T>`.

---

## Route Registration

Routes are registered in `src/app.ts` via `server.register()`:

```typescript
import { createResourceRoute } from "./infra/http/routes/<resource>/create-<resource>.route";

server.register(createResourceRoute);
```

Each route plugin is registered individually — no route grouping or prefix plugins.

---

## URL Conventions

- Resource scoped to an org: `/orgs/:id/<resources>`
- Resource by its own ID: `/<resources>/:resourceId`
