import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { channelsTable } from "./channels.table.ts";

export const colorsTable = pgTable("colors", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  hex: varchar("hex", { length: 9 }).notNull(),
  channelId: text("channel_id")
    .notNull()
    .references(() => channelsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const colorsRelations = relations(colorsTable, ({ one }) => ({
  channel: one(channelsTable, {
    fields: [colorsTable.channelId],
    references: [channelsTable.id],
  }),
}));
