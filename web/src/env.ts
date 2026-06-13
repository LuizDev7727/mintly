import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.url(),
  VITE_NODE_ENV: z.enum(["production", "test", "development"]),
});

export const env = envSchema.parse(import.meta.env);
