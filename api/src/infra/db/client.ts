import { env } from "@/env.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import { tables } from "./tables/index.ts";

export const db = drizzle(env.DATABASE_URL, {
  schema: tables,
  casing: "snake_case",
  logger: env.NODE_ENV === "development",
});
