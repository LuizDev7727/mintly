import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { postsTable } from "./posts.table.ts";

export const postEventStatusEnum = pgEnum("post_event_status", [
  "ENCODED_VIDEO",
  "ENCODED_VIDEO_FAILED",
  "TRANSCRIBED_AUDIO",
  "TRANSCRIBED_AUDIO_FAILED",
  "GENERATED_METADATA",
  "GENERATED_METADATA_FAILED",
  "GENERATED_THUMBNAIL",
  "GENERATED_THUMBNAIL_FAILED",
  "PUBLISHED",
  "PUBLISHED_FAILED",
]);

export const postEventsTable = pgTable(
  "post_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    status: postEventStatusEnum().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    postId: text("post_id")
      .notNull()
      .references(() => postsTable.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [index("post_events_post_id_idx").on(table.postId)],
);

export const postEventsRelations = relations(postEventsTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [postEventsTable.postId],
    references: [postsTable.id],
  }),
}));
