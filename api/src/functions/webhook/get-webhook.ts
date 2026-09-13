import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts"
import { db } from "@/infra/db/client.ts"
import { webhookLogsTable } from "@/infra/db/tables/webhook-log.table.ts"
import {
  webhooksTable,
  type WebhookEventTrigger,
} from "@/infra/db/tables/webhooks.table.ts"
import { desc, eq } from "drizzle-orm"

type GetWebhookParams = {
  webhookId: string
}

type WebhookLogStatus = "PENDING" | "SUCCESS" | "FAILED"

type WebhookLog = {
  id: string
  url: string
  status: WebhookLogStatus
  method: string
  pathname: string
  ip: string
  statusCode: number
  contentType: string | null
  contentLength: number | null
  queryParams: Record<string, string> | null
  headers: Record<string, string>
  body: string | null
  errorReason: string | null
  numberOfRetries: number
  createdAt: Date
  finishedAt: Date | null
}

type GetWebhookResponse = {
  id: string
  url: string
  triggers: WebhookEventTrigger[]
  signingSecret: string
  createdAt: Date
  logs: WebhookLog[]
}

export async function getWebhook(
  params: GetWebhookParams,
): Promise<GetWebhookResponse> {
  const { webhookId } = params

  const [webhook] = await db
    .select()
    .from(webhooksTable)
    .where(
      eq(webhooksTable.id, webhookId)
    )

  if (!webhook) {
    throw new ResourceNotFoundError(`Webhook with id ${webhookId} not found`)
  }

  const logs = await db
    .select()
    .from(webhookLogsTable)
    .where(eq(webhookLogsTable.webhookId, webhookId))
    .orderBy(desc(webhookLogsTable.createdAt))

  return {
    id: webhook.id,
    url: webhook.url,
    triggers: webhook.triggers,
    signingSecret: webhook.signingKey,
    createdAt: webhook.createdAt,
    logs,
  }
}
