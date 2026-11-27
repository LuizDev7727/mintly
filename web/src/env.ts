import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.url(),
  VITE_SENTRY_DSN: z.url(),
  VITE_NODE_ENV: z.enum(["production", "test", "development"]).default("development"),
  VITE_LAUNCH_DAILY_KEY: z.string()
});

export const env = envSchema.parse(import.meta.env);
