import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url().startsWith("postgresql://"),
  ALLOWED_ORIGIN: z.url(),
  BETTER_AUTH_URL: z.url(),
});

export const env = envSchema.parse(process.env);
