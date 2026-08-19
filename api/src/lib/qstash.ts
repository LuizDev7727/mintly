import { env } from "@/env.ts"
import { Client } from "@upstash/qstash"

export const qstash = new Client({
  baseUrl: env.QSTASH_URL,
  token: env.QSTASH_TOKEN,
})
