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
  R2_ENDPOINT: z.url(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET_NAME: z.string(),
  REPLICATE_API_TOKEN: z.string(),
  GEMINI_API_KEY: z.string(),
  TRIGGER_SECRET_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
