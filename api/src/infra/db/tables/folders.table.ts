import { relations } from "drizzle-orm";
import { type AnyPgColumn, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { channelsTable } from "./channels.table.ts";
import { postsTable } from "./posts.table.ts";

export const foldersTable = pgTable("folders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  title: varchar("title").notNull(),
  channelId: text("channel_id")
    .notNull()
    .references(() => channelsTable.id, { onDelete: "cascade" }),
  parentId: text("parent_id").references((): AnyPgColumn => foldersTable.id, {
    onDelete: "cascade",
  }),
});

export const foldersRelations = relations(foldersTable, ({ one, many }) => ({
  channel: one(channelsTable, {
    fields: [foldersTable.channelId],
    references: [channelsTable.id],
  }),
  parent: one(foldersTable, {
    fields: [foldersTable.parentId],
    references: [foldersTable.id],
    relationName: "folder_children",
  }),
  children: many(foldersTable, { relationName: "folder_children" }),
  posts: many(postsTable),
}));
