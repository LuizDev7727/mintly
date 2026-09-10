import { Ingestion } from "@polar-sh/ingestion";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";
import { env } from "@/env.ts";

export const llmIngestion = Ingestion({
  accessToken: await getInfisicalSecret({
    secretName: "POLAR_ACCESS_TOKEN",
  }),
  server: env.NODE_ENV === "production" ? "production" : "sandbox",
})
