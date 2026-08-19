import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts"
import { db } from "@/infra/db/client.ts"
import {
  webhooksTable,
  type WebhookEventTrigger,
} from "@/infra/db/tables/webhooks.table.ts"
import { eq } from "drizzle-orm"

type UpdateWebhookParams = {
  webhookId: string,
  url: string,
  triggers: WebhookEventTrigger[]
}

export async function updateWebhook(params: UpdateWebhookParams) {

  const { webhookId, url, triggers } = params

  const [webhook] = await db
    .select()
    .from(webhooksTable)
    .where(eq(webhooksTable.id, webhookId))

  if (!webhook) {
    throw new ResourceNotFoundError(`Webhook with id ${webhookId} not found`)
  }

  await db
    .update(webhooksTable)
    .set({
      url: url,
      triggers: triggers,
    })
    .where(eq(webhooksTable.id, webhookId))

}
