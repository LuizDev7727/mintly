import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts"
import { db } from "@/infra/db/client.ts"
import { webhookLogsTable } from "@/infra/db/tables/webhook-log.table.ts"
import {
  webhooksTable,
  type WebhookEventTrigger,
} from "@/infra/db/tables/webhooks.table.ts"
import { and, desc, eq, gte } from "drizzle-orm"

// A página mostra as entregas dos últimos 7 dias (o maior intervalo do gráfico).
// O teto evita devolver um histórico sem fim para um webhook muito movimentado.
const LOGS_WINDOW_IN_MS = 7 * 24 * 60 * 60 * 1000
const LOGS_LIMIT = 500

type GetWebhookParams = {
  webhookId: string
  organizationSlug: string
}

type WebhookLogStatus = "PENDING" | "SUCCESS" | "FAILED"

type WebhookLog = {
  id: string
  url: string
  status: WebhookLogStatus
  method: string
  pathname: string
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
  const { webhookId, organizationSlug } = params

  const [webhook] = await db
    .select()
    .from(webhooksTable)
    .where(
      and(
        eq(webhooksTable.id, webhookId),
        eq(webhooksTable.organizationSlug, organizationSlug),
      ),
    )

  if (!webhook) {
    throw new ResourceNotFoundError(`Webhook with id ${webhookId} not found`)
  }

  const logs = await db
    .select()
    .from(webhookLogsTable)
    .where(
      and(
        eq(webhookLogsTable.webhookId, webhookId),
        gte(webhookLogsTable.createdAt, new Date(Date.now() - LOGS_WINDOW_IN_MS)),
      ),
    )
    .orderBy(desc(webhookLogsTable.createdAt))
    .limit(LOGS_LIMIT)

  return {
    id: webhook.id,
    url: webhook.url,
    triggers: webhook.triggers,
    signingSecret: webhook.signingKey,
    createdAt: webhook.createdAt,
    logs,
  }
}
