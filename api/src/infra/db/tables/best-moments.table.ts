import { doublePrecision, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { projectsTable } from "./projects.table.ts";
import { uuidv7 } from "uuidv7";
import { tagsTable } from "./tags.table.ts";

export const bestMomentsTable = pgTable("best_moments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  title: text("title").notNull(),
  description: text("description").default(""),
  storageKey: text("storage_key").notNull(), //change to storageKey
  startTime: doublePrecision("start_time").notNull().default(0), // seconds
  endTime: doublePrecision("end_time").notNull().default(0), // seconds
  size: integer("size").notNull().default(0), // bytes
  projectId: text("project_id").references(() => projectsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bestMomentsRelations = relations(bestMomentsTable, ({ one, many }) => ({
  tags: many(tagsTable),
  project: one(projectsTable, {
    fields: [bestMomentsTable.projectId],
    references: [projectsTable.id],
  }),
}));
