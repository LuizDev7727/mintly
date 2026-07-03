import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { postsTable } from "./posts.table.ts";

export const socialEnum = pgEnum("social_type", ["YOUTUBE", "TIKTOK"]);

export const socialsToPostTable = pgTable("socials_to_post", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  social: socialEnum().notNull(),
  socialName: varchar("social_name").notNull(),
  postId: text("post_id")
    .notNull()
    .references(() => postsTable.id, {
      onDelete: "cascade",
    }),
});

export const socialsToPostRelations = relations(
  socialsToPostTable,
  ({ one }) => ({
    post: one(postsTable, {
      fields: [socialsToPostTable.postId],
      references: [postsTable.id],
    }),
  }),
);
