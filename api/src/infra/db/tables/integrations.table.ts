import { relations } from "drizzle-orm";
import { pgEnum, pgTable, varchar, text, integer } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { channelsTable } from "./channels.table.ts";

export const providerEnum = pgEnum("provider", ["YOUTUBE", "TIKTOK"]);

export const integrationsTable = pgTable("integrations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: varchar().notNull(),
  email: varchar().notNull(),
  avatarUrl: varchar("avatar_url"),
  accessToken: varchar("access_token").notNull(), // [Youtube, Tiktok]
  refresh_token: varchar("refresh_token").notNull(),
  refreshExpiresIn: integer("refresh_expires_in"), // [Tiktok]
  expiry_in: integer("expiry_in").notNull(), // ms - [Youtube, Tiktok]
  provider: providerEnum().notNull(),
  channelId: text("channel_id")
    .notNull()
    .references(() => channelsTable.id, {
      onDelete: "cascade",
    }),
});

export const integrationsRelations = relations(
  integrationsTable,
  ({ one }) => ({
    channel: one(channelsTable, {
      fields: [integrationsTable.channelId],
      references: [channelsTable.id],
    }),
  }),
);
