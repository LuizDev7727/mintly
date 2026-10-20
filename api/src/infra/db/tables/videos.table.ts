import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { channelsTable } from "./channels.table.ts";

export const videoStatusEnum = pgEnum("video_status", [
  "READY",
  "GENERATING",
  "FAILED",
]);

export const videosTable = pgTable("videos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  // Fica nulo enquanto o vídeo ainda está sendo gerado.
  filename: varchar("filename").notNull(),
  size: integer().notNull(),
  status: videoStatusEnum("status").notNull().default("GENERATING"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  channelId: text("channel_id")
    .notNull()
    .references(() => channelsTable.id, { onDelete: "cascade" }),
});

export const videosRelations = relations(videosTable, ({ one }) => ({
  channel: one(channelsTable, {
    fields: [videosTable.channelId],
    references: [channelsTable.id],
  }),
}));
