import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum([
    "production",
    "development",
    "test",
  ]).default("development"),
  PORT: z.coerce.number().default(3000),
  INFISICAL_CLIENT_ID: z.string(),
  INFISICAL_CLIENT_SECRET: z.string(),
  INFISICAL_PROJECT_ID: z.string(),
  INFISICAL_ENVIRONMENT: z.string(),
});

export const env = envSchema.parse(process.env);
