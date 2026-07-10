import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { channelsTable } from "./channels.table.ts";
import { invitationsTable } from "./invitations.table.ts";
import { membersTable } from "./members.table.ts";
import { usersTable } from "./users.table.ts";

export const planEnum = pgEnum("plan", ["free", "pro"]);

export const organizationsTable = pgTable(
  "organizations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    billingEmail: varchar("billing_email").notNull().default(""),
    plan: planEnum("plan").notNull().default("free"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    metadata: text("metadata"),
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [uniqueIndex("organization_id_uidx").on(table.id)],
);

export const organizationRelations = relations(
  organizationsTable,
  ({ many, one }) => ({
    members: many(membersTable),
    invitations: many(invitationsTable),
    channels: many(channelsTable),
    owner: one(usersTable, {
      fields: [organizationsTable.ownerId],
      references: [usersTable.id],
    }),
  }),
);
