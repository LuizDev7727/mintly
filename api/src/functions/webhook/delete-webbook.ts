import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts"
import { db } from "@/infra/db/client.ts"
import { webhooksTable } from "@/infra/db/tables/webhooks.table.ts"
import { eq } from "drizzle-orm"

type DeleteWebhookParams = {
  webhookId: string
}

export async function deleteWebhook(params: DeleteWebhookParams) {

  const { webhookId } = params

  const [webhook] = await db
    .select()
    .from(webhooksTable)
    .where(eq(webhooksTable.id, webhookId))

  if (!webhook) {
    throw new ResourceNotFoundError(`Webhook with id ${webhookId} not found`)
  }

  await db.delete(webhooksTable).where(eq(webhooksTable.id, webhookId))
}
