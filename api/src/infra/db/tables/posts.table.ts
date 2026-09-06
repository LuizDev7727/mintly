import { relations, sql, type SQL } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { foldersTable } from "./folders.table.ts";
import { usersTable } from "./users.table.ts";
import { socialsToPostTable } from "./socials-to-post.table.ts";
import { channelsTable } from "./channels.table.ts";
import { tsVector } from "./columns/ts-vector.column.ts";

export const statusEnum = pgEnum("post_status", [
  "PROCESSING",
  "SCHEDULED",
  "PUBLISHED",
  "ERROR",
  "ENCODING",
  "TRANSCRIBING",
  "SEO_GENERATING",
  "GENERATING_METADATA",
  "GENERATING_THUMBNAIL",
  "PUBLISHING",
  "CANCELED",
]);

export const postsTable = pgTable(
  "posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    thumbnailStorageKey: varchar("thumbnail_storage_key"),
    title: varchar("title").notNull(),
    mimeType: varchar("mime_type").notNull(),
    description: varchar("description").notNull(),
    runId: varchar("run_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    size: integer().notNull(),
    duration: integer().notNull(), // seconds
    status: statusEnum().notNull().default("PROCESSING"),
    transcription: jsonb("transcription"),
    scheduledTo: timestamp("scheduled_to", { withTimezone: true }),

    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),
    folderId: text("folder_id").references(() => foldersTable.id, {
      onDelete: "set null",
    }),
    channelId: text("channel_id")
      .notNull()
      .references(() => channelsTable.id, {
        onDelete: "cascade",
      }),
    searchVector: tsVector("search_vector").generatedAlwaysAs(
      (): SQL =>
        sql`immutable_to_tsvector(coalesce(title, '') || ' ' || coalesce(description, ''))`,
    ),
  },
  (table) => [index("posts_search_vector_idx").using("gin", table.searchVector)],
);

export const postsRelations = relations(postsTable, ({ one, many }) => ({
  socialsToPost: many(socialsToPostTable),
  folder: one(foldersTable, {
    fields: [postsTable.folderId],
    references: [foldersTable.id],
  }),
  channel: one(channelsTable, {
    fields: [postsTable.channelId],
    references: [channelsTable.id],
  }),
}));
