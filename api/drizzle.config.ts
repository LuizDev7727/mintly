import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/infra/db/tables/*.table.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
