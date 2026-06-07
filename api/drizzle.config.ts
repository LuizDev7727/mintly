import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/infra/db/tables",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
