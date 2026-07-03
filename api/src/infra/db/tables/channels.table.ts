import { relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { organizationsTable } from "./organizations.table.ts";
import { postsTable } from "./posts.table.ts";

export const channelsTable = pgTable("channels", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().default(""),
  organizationSlug: text("organization_slug")
    .notNull()
    .references(() => organizationsTable.slug, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const channelsRelations = relations(channelsTable, ({ one, many }) => ({
  posts: many(postsTable),
  organization: one(organizationsTable, {
    fields: [channelsTable.organizationSlug],
    references: [organizationsTable.slug],
  }),
}));
