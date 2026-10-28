import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { channelsTable } from "./channels.table.ts";
import { providerEnum } from "./integrations.table.ts";
import { usersTable } from "./users.table.ts";

// `state` do OAuth de uma integração: emitido quando o usuário pede a URL do
// provedor e consumido (uma vez) no callback. O id é o valor enviado ao
// provedor, por isso é aleatório e imprevisível (não um uuidv7).
export const oauthStatesTable = pgTable("oauth_states", {
  id: text("id").primaryKey(),
  provider: providerEnum().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  organizationSlug: text("organization_slug").notNull(),
  channelId: text("channel_id")
    .notNull()
    .references(() => channelsTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
