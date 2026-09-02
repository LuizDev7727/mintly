import { Client } from "@upstash/qstash"
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts"

export const qstash = new Client({
  baseUrl: await getInfisicalSecret({ secretName: "QSTASH_URL" }),
  token: await getInfisicalSecret({ secretName: "QSTASH_TOKEN" }),
})
