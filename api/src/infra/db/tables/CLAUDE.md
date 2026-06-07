# Drizzle ORM — Padrões e Convenções

## Estrutura de Diretórios

```
src/infra/db/
    ├── client.ts          # Instância única do banco
    └── tables/
        ├── index.ts       # Barrel file com objeto `tables`
        ├── users.table.ts
        ├── resource-a.table.ts
        └── ...

drizzle/
└── migrations/
    ├── 0000_description.sql
    ├── 0001_description.sql
    └── meta/
        ├── _journal.json        # Registro das migrations aplicadas
        └── 0000_snapshot.json   # Snapshot do schema por migration
```

---

## Cliente do Banco (`client.ts`)

Instância única exportada de um único arquivo. Recebe o objeto `tables` como `schema` para habilitar tipagem nas queries com relações.

```typescript
import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from '@/env'
import { tables } from './tables'

export const db = drizzle(env.DATABASE_URL, {
  schema: tables,
  casing: 'snake_case',
  logger: process.env.NODE_ENV === 'development',
})
```

- `casing: 'snake_case'` — campos TypeScript em `camelCase` são convertidos automaticamente para `snake_case` no banco. Não é necessário declarar o nome da coluna quando ele coincide com o padrão.
- `logger` — ativo apenas em desenvolvimento.
- Importe sempre de `@/database/drizzle/client`, nunca instancie o cliente em outro lugar.

---

## Barrel File (`tables/index.ts`)

Todas as tables são reunidas em um único objeto `tables`, que é passado ao cliente como `schema`:

```typescript
import { usersTable } from './users.table'
import { resourceATable } from './resource-a.table'
// ...

export const tables = {
  usersTable,
  resourceATable,
  // ...
}
```

---

## Convenções de Nomenclatura

| O quê | Convenção | Exemplo |
|---|---|---|
| Arquivo | `kebab-case.table.ts` | `resource-a.table.ts` |
| Nome da table no DB | `snake_case` (string) | `"resource_items"` |
| Campo TypeScript | `camelCase` | `createdAt`, `ownerId` |
| Nome da coluna no DB | `snake_case` (string) | `"created_at"`, `"owner_id"` |
| Export da table | `{nome}Table` | `resourceATable` |
| Export das relations | `{nome}Relations` | `resourceARelations` |
| Export do enum | `{nome}Enum` | `statusEnum` |
| Valor do enum | `UPPER_SNAKE_CASE` | `"PROCESSING"`, `"FREE"` |

---

## Anatomia de um Arquivo de Table

Cada arquivo exporta a definição da table e suas relations. Enums ficam no mesmo arquivo da table que os usa.

```typescript
import { pgTable, pgEnum, text, varchar, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'
import { usersTable } from './users.table'
import { tenantsTable } from './tenants.table'

// Enum definido no mesmo arquivo que o consome
export const statusEnum = pgEnum('item_status', [
  'SUCCESS',
  'PROCESSING',
  'SCHEDULED',
  'ERROR',
])

export const itemsTable = pgTable('items', {
  id: text('id').primaryKey().$defaultFn(() => uuidv7()),
  title: varchar('title').notNull(),
  status: statusEnum().notNull().default('PROCESSING'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  tenantSlug: text('tenant_slug')
    .notNull()
    .references(() => tenantsTable.slug, { onDelete: 'cascade' }),
})

export const itemsRelations = relations(itemsTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [itemsTable.ownerId],
    references: [usersTable.id],
  }),
  tenant: one(tenantsTable, {
    fields: [itemsTable.tenantSlug],
    references: [tenantsTable.slug],
  }),
}))
```

---

## Chave Primária

Todas as tables usam UUID v7 gerado pelo servidor como PK textual:

```typescript
id: text('id').primaryKey().$defaultFn(() => uuidv7())
```

> UUID v7 é baseado em tempo, o que o torna ordenável cronologicamente e mais eficiente para índices B-tree do que UUID v4.

---

## Timestamps

Três variações de uso:

```typescript
// Somente na inserção — nunca atualizado
createdAt: timestamp('created_at').notNull().defaultNow()

// Inserção + atualização automática a cada escrita
updatedAt: timestamp('updated_at')
  .defaultNow()
  .$onUpdate(() => new Date())
  .notNull()

// Com timezone — para datas de agendamento ou eventos futuros
scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull().defaultNow()
```

---

## Tipos de Coluna

### `text` vs `varchar`
- `text` — IDs, conteúdo longo, descrições, metadados sem limite de tamanho definido.
- `varchar` — strings curtas com tamanho previsível: títulos, URLs, tokens OAuth.

### `integer`
Para valores numéricos: tamanho de arquivo em bytes, duração em segundos, timestamps de expiração em ms.

```typescript
size: integer().notNull()
duration: integer().notNull()
expiresIn: integer('expires_in').notNull().default(0)
```

### `boolean`
```typescript
isVerified: boolean('is_verified').default(false).notNull()
```

### `jsonb`
Para dados semi-estruturados sem schema fixo:
```typescript
metadata: jsonb('metadata')
```

---

## Enums

Definidos com `pgEnum` no mesmo arquivo da table que os utiliza. Valores sempre em `UPPER_SNAKE_CASE`:

```typescript
export const statusEnum = pgEnum('item_status', ['SUCCESS', 'PROCESSING', 'SCHEDULED', 'ERROR'])
export const planEnum = pgEnum('tenant_plan', ['FREE', 'PRO', 'PREMIUM'])
export const typeEnum = pgEnum('resource_type', ['TYPE_A', 'TYPE_B'])
```

---

## Chaves Estrangeiras e `onDelete`

Duas estratégias:

```typescript
// Cascade — deleta o filho quando o pai é deletado (padrão na maioria dos casos)
ownerId: text('owner_id')
  .notNull()
  .references(() => usersTable.id, { onDelete: 'cascade' })

// Set null — preserva o registro filho, apenas anula a referência
ownerId: text('owner_id')
  .notNull()
  .references(() => usersTable.id, { onDelete: 'set null' })
```

Use `cascade` quando o filho não faz sentido sem o pai. Use `set null` quando o filho deve sobreviver à exclusão do pai (ex: o autor de um registro foi deletado, mas o registro em si deve permanecer).

---

## Relations

Relations são definidas **separadamente** da table, no mesmo arquivo, usando `relations()`. Elas não criam colunas — servem apenas para tipagem e queries com `with`:

```typescript
export const itemsRelations = relations(itemsTable, ({ one, many }) => ({
  // many-to-one: item pertence a um owner
  owner: one(usersTable, {
    fields: [itemsTable.ownerId],   // coluna local (FK)
    references: [usersTable.id],    // coluna referenciada
  }),

  // one-to-many: item tem muitos comentários
  comments: many(commentsTable),
}))
```

- `one()` — para o lado que contém a FK (many-to-one ou one-to-one).
- `many()` — para o lado oposto da relação (one-to-many). Não precisa de `fields`/`references`.
- Sempre informe `fields` e `references` no `one()` quando a relação não é trivialmente inferível.

---

## Table de Junção (Many-to-Many)

Crie uma table intermediária com sua própria PK. Ela pode ter colunas extras além das FKs:

```typescript
export const typeEnum = pgEnum('resource_type', ['TYPE_A', 'TYPE_B'])

export const itemsToTargetsTable = pgTable('items_to_targets', {
  id: text('id').primaryKey().$defaultFn(() => uuidv7()),
  type: typeEnum().notNull(),
  itemId: text('item_id')
    .notNull()
    .references(() => itemsTable.id, { onDelete: 'cascade' }),
  targetId: text('target_id')
    .notNull()
    .references(() => targetsTable.id, { onDelete: 'cascade' }),
})

export const itemsToTargetsRelations = relations(itemsToTargetsTable, ({ one }) => ({
  item: one(itemsTable, {
    fields: [itemsToTargetsTable.itemId],
    references: [itemsTable.id],
  }),
  target: one(targetsTable, {
    fields: [itemsToTargetsTable.targetId],
    references: [targetsTable.id],
  }),
}))
```

---

## Multi-tenancy via Slug

Referencie o tenant pelo `slug` ao invés do `id` nas FKs das outras tables. Isso permite usar o slug da URL diretamente nas queries sem lookups adicionais:

```typescript
// Na table de tenant:
slug: text('slug').notNull().unique()

// Em todas as outras tables:
tenantSlug: text('tenant_slug')
  .notNull()
  .references(() => tenantsTable.slug, { onDelete: 'cascade' })
```

---

## `drizzle.config.ts`

Arquivo na raiz do projeto. Aponta para o schema e o diretório de saída das migrations:

```typescript
import { defineConfig } from 'drizzle-kit'
import { env } from '@/env'

export default defineConfig({
  schema: './src/database/drizzle/tables',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
```

---

## Migrations

Geradas automaticamente a partir das definições de table. Nunca edite arquivos de migration manualmente — altere as tables e gere uma nova migration:

```bash
pnpm db:generate   # gera o SQL
pnpm db:migrate    # aplica ao banco
```

Cada migration produz:
- `NNNN_slug-descritivo.sql` — SQL a ser aplicado.
- `meta/NNNN_snapshot.json` — snapshot completo do schema naquele ponto.
- `meta/_journal.json` — registro cronológico de todas as migrations.
