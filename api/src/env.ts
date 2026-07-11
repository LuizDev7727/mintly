import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url().startsWith("postgresql://"),
  ALLOWED_ORIGIN: z.url(),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.url(),
  GOOGLE_REDIRECT_CALLBACK_URI: z.url(),
});

export const env = envSchema.parse(process.env);
