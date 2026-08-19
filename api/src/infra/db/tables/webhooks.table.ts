import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { organizationsTable } from './organizations.table.ts'
import { uuidv7 } from 'uuidv7'

export const webhookEventTrigger = z.enum([
  'post.created',
  'post.failed',
  'post.posted',
  'project.created',
])

export type WebhookEventTrigger = z.infer<typeof webhookEventTrigger>

export const webhooksTable = pgTable("webhooks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  url: text("url").notNull(),
  signingKey: text("signing_key").notNull(),
  triggers: text("events").array().$type<WebhookEventTrigger[]>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  organizationSlug: text("organization_slug")
    .notNull()
    .references(() => organizationsTable.slug, {
      onDelete: "cascade",
    }),
});

export const webhooksRelations = relations(webhooksTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [webhooksTable.organizationSlug],
    references: [organizationsTable.slug],
  }),
}));
