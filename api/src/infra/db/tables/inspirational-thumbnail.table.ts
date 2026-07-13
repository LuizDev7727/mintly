import { relations } from "drizzle-orm";
import { pgEnum, pgTable, varchar, text, integer } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { channelsTable } from "./channels.table.ts";

export const inspirationalThumbnailsTable = pgTable("inspirational_thumbnails", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: varchar().notNull(),
  key: varchar().notNull(),
  type: varchar().notNull(),
  sizeInMs: integer("size_in_ms").notNull(),
  channelId: text("channel_id")
    .notNull()
    .references(() => channelsTable.id, {
      onDelete: "cascade",
    }),
});

export const integrationsRelations = relations(
  inspirationalThumbnailsTable,
  ({ one }) => ({
    channel: one(channelsTable, {
      fields: [inspirationalThumbnailsTable.channelId],
      references: [channelsTable.id],
    }),
  }),
);
