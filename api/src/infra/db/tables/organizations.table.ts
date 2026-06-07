import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { invitationsTable } from "./invitations.table.ts";
import { membersTable } from "./members.table.ts";

export const organizationsTable = pgTable(
  "organizations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    metadata: text("metadata"),
  },
  (table) => [uniqueIndex("organization_id_uidx").on(table.id)],
);

export const organizationRelations = relations(
  organizationsTable,
  ({ many }) => ({
    members: many(membersTable),
    invitations: many(invitationsTable),
  }),
);
