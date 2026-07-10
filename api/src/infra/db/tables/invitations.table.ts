import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { organizationsTable } from "./organizations.table.ts";
import { usersTable } from "./users.table.ts";

export const invitationsTable = pgTable(
  "invitations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    organizationSlug: text("organization_id")
      .notNull()
      .references(() => organizationsTable.slug, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitation_organizationSlug_idx").on(table.organizationSlug),
    index("invitation_email_idx").on(table.email),
  ],
);

export const invitationRelations = relations(invitationsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [invitationsTable.organizationSlug],
    references: [organizationsTable.slug],
  }),
  user: one(usersTable, {
    fields: [invitationsTable.inviterId],
    references: [usersTable.id],
  }),
}));
