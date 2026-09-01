import { InfisicalSDK } from '@infisical/sdk'
import { env } from '@/env.ts'

export const infisical = new InfisicalSDK();

await infisical.auth().universalAuth.login({
  clientId: env.INFISICAL_CLIENT_ID,
  clientSecret: env.INFISICAL_CLIENT_SECRET,
});
