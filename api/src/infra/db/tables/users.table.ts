import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { sessionsTable } from "./sessions.table.ts";
import { accountsTable } from "./accounts.table.ts";
import { membersTable } from "./members.table.ts";
import { invitationsTable } from "./invitations.table.ts";
import { organizationsTable } from "./organizations.table.ts";

export const usersTable = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  credits: integer("credits").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const userRelations = relations(usersTable, ({ many }) => ({
  sessions: many(sessionsTable),
  accounts: many(accountsTable),
  members: many(membersTable),
  invitations: many(invitationsTable),
  organizations: many(organizationsTable),
}));
