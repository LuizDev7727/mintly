import { Env, env } from "@/env.ts";
import { infisical } from "@/lib/infisical.ts";

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
