import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { foldersTable } from "./folders.table.ts";

export const postsTable = pgTable("posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  folderId: text("folder_id").references(() => foldersTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postsRelations = relations(postsTable, ({ one }) => ({
  folder: one(foldersTable, {
    fields: [postsTable.folderId],
    references: [foldersTable.id],
  }),
}));
