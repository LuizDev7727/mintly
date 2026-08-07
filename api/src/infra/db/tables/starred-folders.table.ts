import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { channelsTable } from "./channels.table.ts";
import { foldersTable } from "./folders.table.ts";

export const starredFoldersTable = pgTable("starred_folders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  folderId: text("folder_id")
    .notNull()
    .references(() => foldersTable.id, { onDelete: "cascade" }),
  channelId: text("channel_id")
    .notNull()
    .references(() => channelsTable.id, { onDelete: "cascade" }),
});

export const starredFoldersRelations = relations(
  starredFoldersTable,
  ({ one }) => ({
    folder: one(foldersTable, {
      fields: [starredFoldersTable.folderId],
      references: [foldersTable.id],
    }),
    channel: one(channelsTable, {
      fields: [starredFoldersTable.channelId],
      references: [channelsTable.id],
    }),
  }),
);
