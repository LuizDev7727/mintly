import { env } from '@/env'
import { PostHog } from 'posthog-node'

export const posthogClient = new PostHog(
  env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
  {
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0
  }
)
