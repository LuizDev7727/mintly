import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: z.string(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string()
})

export const env = envSchema.parse(process.env)
