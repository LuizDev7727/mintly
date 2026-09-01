import { env } from "@/env.ts";
import { infisical } from "@/lib/infisical.ts";

type Env = {
  NODE_ENV: "production" | "development" | "test";
  PORT: number;
  DATABASE_URL: string;
  ALLOWED_ORIGIN: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  GOOGLE_REDIRECT_CALLBACK_URI: string;
  R2_ENDPOINT: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  REPLICATE_API_TOKEN: string;
  GEMINI_API_KEY: string;
  TRIGGER_SECRET_KEY: string;
  MODAL_URL: string;
  MODAL_TRANSCRIBE_AUDIO_URL: string;
  TIKTOK_CLIENT_KEY: string;
  TIKTOK_CLIENT_SECRET: string;
  TIKTOK_REDIRECT_URI: string;
  RESEND_API_KEY: string;
  TIKTOK_REDIRECT_CALLBACK_URI: string;
  QSTASH_URL: string;
  QSTASH_TOKEN: string;
  QSTASH_CURRENT_SIGNING_KEY: string;
  QSTASH_NEXT_SIGNING_KEY: string;
  QSTASH_TOPIC_URL: string;
  AES_ENCRYPTION_KEY: string;
  INFISICAL_CLIENT_ID: string;
  INFISICAL_CLIENT_SECRET: string;
  INFISICAL_PROJECT_ID: string;
  INFISICAL_ENVIRONMENT: string;
  INSTAGRAM_APP_ID: string;
  INSTAGRAM_APP_SECRET: string;
  INSTAGRAM_ACCESS_TOKEN: string;
  INSTAGRAM_REDIRECT_URI: string;
  INSTAGRAM_REDIRECT_CALLBACK_URI: string;
};

type GetInfisicalSecretProps = {
  secretName: keyof Env;
}

type GetInfisicalSecretResponse = Promise<string>;

export async function getInfisicalSecret(
  { secretName }: GetInfisicalSecretProps,
): GetInfisicalSecretResponse {
  const singleSecret = await infisical.secrets().getSecret({
    environment: env.INFISICAL_ENVIRONMENT,
    projectId: env.INFISICAL_PROJECT_ID,
    secretName,
  });

  const value = singleSecret.secretValue;

  return value
}
