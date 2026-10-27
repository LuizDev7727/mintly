import { Client } from "@upstash/qstash"
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts"

export const qstash = new Client({
  baseUrl: await getInfisicalSecret({ secretName: "QSTASH_URL" }),
  token: await getInfisicalSecret({ secretName: "QSTASH_TOKEN" }),
})

// Lido uma vez, junto com a URL e o token: o `getInfisicalSecret` não tem cache,
// e buscá-lo a cada webhook publicado faria uma chamada de rede ao Infisical
// por publicação (e sujeita ao limite de requisições dele).
export const qstashTopicUrl = await getInfisicalSecret({ secretName: "QSTASH_TOPIC_URL" })
