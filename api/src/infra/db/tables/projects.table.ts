import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { timestamp } from "drizzle-orm/pg-core";
import { channelsTable } from "./channels.table.ts";
import { usersTable } from "./users.table.ts";
import { bestMomentsTable } from "./best-moments.table.ts";

export const projectStatusEnum = pgEnum("project_status", [
  "SUCCESS",
  "PROCESSING",
  "SCHEDULED",
  "ERROR",
  "CANCELED",
]);

export const projectsTable = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  title: varchar().notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  runId: text("run_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: projectStatusEnum().notNull().default("PROCESSING"),
  channelId: text("channel_id")
    .notNull()
    .references(() => channelsTable.id, {
      onDelete: "cascade",
    }),
  ownerId: text("owner_id")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "set null",
    }),
});

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  bestMoments: many(bestMomentsTable),
  channel: one(channelsTable, {
    fields: [projectsTable.channelId],
    references: [channelsTable.id],
  }),
  owner: one(usersTable, {
    fields: [projectsTable.ownerId],
    references: [usersTable.id],
  }),
}));
