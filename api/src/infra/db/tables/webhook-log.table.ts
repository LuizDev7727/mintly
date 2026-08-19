import { relations } from 'drizzle-orm'
import { integer, jsonb, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { webhooksTable } from './webhooks.table.ts'

export const webhookLogStatus = pgEnum('WebhookLogStatus', [
  'PENDING',
  'SUCCESS',
  'FAILED',
])

export const webhookLogsTable = pgTable("webhook_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  url: text("url").notNull(),
  signingKey: text("signing_key").notNull(),
  status: webhookLogStatus('status').default('PENDING').notNull(),
  method: text().notNull(),
  pathname: text().notNull(),
  ip: text().notNull(),
  statusCode: integer('status_code').notNull().default(200),
  contentType: text('content_type'),
  contentLength: integer('content_length'),
  queryParams: jsonb('query_params').$type<Record<string, string>>(),
  headers: jsonb().$type<Record<string, string>>().notNull(),
  body: text(),
  errorReason: text('error_reason'),
  numberOfRetries: integer('number_of_retries').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  finishedAt: timestamp('finished_at'),
  webhookId: text("webhook_id")
    .notNull()
    .references(() => webhooksTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export const webhookLogRelations = relations(webhookLogsTable, ({ one }) => ({
  webhook: one(webhooksTable, {
    fields: [webhookLogsTable.webhookId],
    references: [webhooksTable.id],
  }),
}));
