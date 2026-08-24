import { z } from "zod";

const envSchema = z.object({
  MINTLY_API_KEY: z.string().min(1, "MINTLY_API_KEY is required"),
  MINTLY_API_URL: z.url(),
});

export const env = envSchema.parse(process.env);
