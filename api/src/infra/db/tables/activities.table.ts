import { relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { organizationsTable } from "./organizations.table.ts";
import { usersTable } from "./users.table.ts";

export const actionEnum = pgEnum("action", [
  "CREATED_CHANNEL",
  "CREATED_POST",
  "CANCELED_POST",
  "DELETED_POST",
  "CREATED_PROJECT",
  "ADDED_INTEGRATION",
  "DELETED_INTEGRATION",
  "UPLOAD_INSPIRATIONAL_THUMBNAIL",
  "DELETED_INSPIRATIONAL_THUMBNAIL",
]);

export const activitiesTable = pgTable("activities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  action: actionEnum().notNull(),
  description: varchar("description").notNull().default(""),
  organizationSlug: text("organization_slug")
    .notNull()
    .references(() => organizationsTable.slug, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activitiesRelations = relations(activitiesTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [activitiesTable.organizationSlug],
    references: [organizationsTable.slug],
  }),
  author: one(usersTable, {
    fields: [activitiesTable.authorId],
    references: [usersTable.id],
  }),
}));
