import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { organizationsTable } from "./organizations.table.ts";
import { usersTable } from "./users.table.ts";

export const membersTable = pgTable(
  "members",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    organizationSlug: text("organization_id")
      .notNull()
      .references(() => organizationsTable.slug, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    index("member_organizationSlug_idx").on(table.organizationSlug),
    index("member_userId_idx").on(table.userId),
  ],
);

export const memberRelations = relations(membersTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [membersTable.organizationSlug],
    references: [organizationsTable.slug],
  }),
  user: one(usersTable, {
    fields: [membersTable.userId],
    references: [usersTable.id],
  }),
}));
