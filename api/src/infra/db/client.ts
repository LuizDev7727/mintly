import { env } from "@/env.ts";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import { tables } from "./tables/index.ts";

export const db = drizzle(await getInfisicalSecret({ secretName: "DATABASE_URL" }), {
  schema: tables,
  casing: "snake_case",
  logger: env.NODE_ENV === "development",
});
