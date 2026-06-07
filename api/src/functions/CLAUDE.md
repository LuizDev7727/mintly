# Functions

Pure business-logic layer. Each function receives typed params, queries/mutates the database (via Drizzle ORM), optionally triggers async tasks (via Trigger.dev), and returns typed data. No HTTP, no framework.

## File naming

`<verb>-<resource>.ts` — camelCase export that matches the file name.

```
create-playlist.ts   → createPlaylist()
get-posts.ts         → getPosts()
update-playlist.ts   → updatePlaylist()
delete-playlist.ts   → deletePlaylist()
```

## Anatomy of a function

```ts
import { db } from "@/infra/db/client";
import { someTable } from "@/infra/db/tables/some.table";

type CreateSomethingParams = {
  orgSlug: string;
  name: string;
};

type CreateSomethingResponse = {
  somethingId: string;
};

export async function createSomething(
  params: CreateSomethingParams,
): Promise<CreateSomethingResponse> {
  const { orgSlug, name } = params;

  const [{ somethingId }] = await db
    .insert(someTable)
    .values({ name, organizationSlug: orgSlug })
    .returning({ somethingId: someTable.id });

  return { somethingId };
}
```

**Rules:**
- Always define `*Params` and `*Response` types locally in the file.
- Always destructure `params` at the top of the function body.
- Use `Promise<ResponseType>` on the signature. Omit it only when the function returns nothing (void).
- Never leak Drizzle internals — shape the return value explicitly.

## Params conventions

| Field | Type | When to use |
|---|---|---|
| `orgSlug` | `string` | Every function scoped to an organization |
| `ownerId` / `authorId` | `string` | When creating a resource owned by a user |
| `<resource>Id` | `string` | When targeting a specific record |
| `cursor` | `string` | Cursor-based pagination |
| `limit` | `number` | Max records to return |
| `pageIndex` / `pageSize` | `number` | Offset-based pagination |
| `titleFilter` | `string?` | Optional text search filter |

## Database operations

Import `db` from `@/infra/db/client`. Import table definitions from `@/infra/db/tables/*.table`.

### Insert and return the ID

```ts
const [{ resourceId }] = await db
  .insert(resourceTable)
  .values({ ... })
  .returning({ resourceId: resourceTable.id });
```

### Select with joins

```ts
import { and, eq, desc } from "drizzle-orm";

const rows = await db
  .select({
    id: resourceTable.id,
    owner: {
      name: usersTable.name,
      avatarUrl: usersTable.image,
    },
  })
  .from(resourceTable)
  .innerJoin(usersTable, eq(resourceTable.ownerId, usersTable.id))
  .where(and(
    eq(resourceTable.organizationSlug, orgSlug),
    filter ? like(resourceTable.title, `%${filter}%`) : undefined,
  ))
  .orderBy(desc(resourceTable.createdAt));
```

### Update

```ts
import { eq } from "drizzle-orm";

await db
  .update(someTable)
  .set({ name })
  .where(eq(someTable.id, id));
```

### Delete

```ts
import { eq } from "drizzle-orm";

await db.delete(someTable).where(eq(someTable.id, id));
```

### Parallel queries with Promise.all

Use `Promise.all` when firing multiple independent queries (e.g., data + total count):

```ts
const [rows, [{ total }]] = await Promise.all([
  db.select({ ... }).from(...).where(...).limit(pageSize).offset(pageIndex * pageSize),
  db.select({ total: count() }).from(...).where(...),
]);
```

## Pagination

### Offset-based (tables/lists with page controls)

```ts
type GetItemsParams = {
  orgSlug: string;
  pageIndex: number;
  pageSize: number;
  titleFilter?: string;
};

type GetItemsResponse = {
  items: { id: string; title: string }[];
  meta: {
    totalCount: number;
    totalPages: number;
  };
};

// Inside the function:
const [items, [{ totalCount }]] = await Promise.all([
  db.select({ ... }).from(...).where(...).offset(pageIndex * pageSize).limit(pageSize),
  db.select({ totalCount: count() }).from(...).where(...),
]);

const totalPages = Math.ceil(totalCount / pageSize);
return { items, meta: { totalCount, totalPages } };
```

### Cursor-based (infinite scroll / feeds)

```ts
import { and, desc, eq, lt } from "drizzle-orm";

type GetItemsParams = {
  orgSlug: string;
  cursor?: string;
  limit: number;
};

type GetItemsResponse = {
  items: { id: string }[];
  nextCursor: string | null;
};

// Inside the function:
const rows = await db
  .select({ id: someTable.id, ... })
  .from(someTable)
  .where(and(
    eq(someTable.organizationSlug, orgSlug),
    cursor ? lt(someTable.id, cursor) : undefined,
  ))
  .orderBy(desc(someTable.id))
  .limit(limit + 1); // fetch one extra to detect if there's a next page

const hasMore = rows.length > limit;
const items = hasMore ? rows.slice(0, limit) : rows;
const nextCursor = hasMore ? items[items.length - 1].id : null;

return { items, nextCursor };
```

## Error handling

Throw with a `statusCode` property for errors the HTTP layer should translate:

```ts
if (!record) {
  throw Object.assign(new Error("Resource not found"), { statusCode: 404 });
}
```

Only throw when something actually went wrong. Don't add defensive checks for impossible states.

## Triggering async tasks (Trigger.dev)

When creating a resource that requires background processing, insert the record first, then trigger the task:

```ts
import { tasks } from "@trigger.dev/sdk";
import { myTask } from "@/trigger/tasks/my.task";

const [{ resourceId }] = await db
  .insert(resourceTable)
  .values({ ... })
  .returning({ resourceId: resourceTable.id });

await tasks.trigger<typeof myTask>("task-id", {
  resourceId,
  someParam,
});

return { resourceId };
```

Task IDs (first arg to `tasks.trigger`) must match the `id` defined in the task file under `@/trigger/tasks/`.

## JSON aggregation (raw SQL)

Use `sql` from `drizzle-orm` for aggregations not natively supported:

```ts
import { sql } from "drizzle-orm";

db.select({
  items: sql<{ id: string; name: string }[]>`
    json_agg(json_build_object('id', ${table.id}, 'name', ${table.name}))
  `.as("items"),
})
.from(table)
.groupBy(parentTable.id);
```

Always provide an explicit TypeScript type for `sql<T>` and give it an alias with `.as()`.

## Folder structure

Group files by domain. Each domain folder holds all CRUD operations for that resource:

```
functions/
├── activity/
│   ├── create-activity.ts
│   └── get-activities.ts
├── integrations/
│   ├── connect-tiktok.ts
│   ├── connect-youtube.ts
│   ├── get-integrations.ts
│   └── request-youtube-integration-url.ts
├── organization/
│   ├── create-organization.ts
│   ├── delete-organization.ts
│   ├── get-members.ts
│   ├── get-metrics.ts
│   ├── get-organization.ts
│   └── get-organizations.ts
├── playlist/
│   ├── create-playlist.ts
│   ├── delete-playlist.ts
│   ├── get-playlists.ts
│   └── update-playlist.ts
├── post/
│   ├── create-posts.ts
│   ├── delete-post.ts
│   └── get-posts.ts
└── project/
    ├── create-project.ts
    └── get-projects.ts
```

Each file exports exactly one function. No barrel `index.ts` — import directly from the file path.
