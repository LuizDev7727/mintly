import { relations } from "drizzle-orm";
import { index, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { postsTable } from "./posts.table.ts";
import { bestMomentsTable } from "./best-moments.table.ts";

export const tagsTable = pgTable(
  "tags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    name: varchar("name").notNull(),
    postId: text("post_id").references(() => postsTable.id, {
      onDelete: "cascade",
    }),
    bestMomentId: text("best_moment_id").references(() => bestMomentsTable.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [
    index("tags_post_id_idx").on(table.postId),
    index("tags_best_moment_id_idx").on(table.bestMomentId),
  ],
);

export const tagsRelations = relations(tagsTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [tagsTable.postId],
    references: [postsTable.id],
  }),
  bestMoment: one(bestMomentsTable, {
    fields: [tagsTable.bestMomentId],
    references: [bestMomentsTable.id],
  }),
}));
