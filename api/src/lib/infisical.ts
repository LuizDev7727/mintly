import { InfisicalSDK } from '@infisical/sdk'
import { env } from '@/env.ts'
import { retryOnRateLimit } from '@/utils/infisical/retry-on-rate-limit.ts'

export const infisical = new InfisicalSDK();

await retryOnRateLimit(() =>
  infisical.auth().universalAuth.login({
    clientId: env.INFISICAL_CLIENT_ID,
    clientSecret: env.INFISICAL_CLIENT_SECRET,
  }),
);
