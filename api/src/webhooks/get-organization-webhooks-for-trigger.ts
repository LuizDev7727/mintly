import { z } from "zod"
import { webhookEventTriggerSchema } from "./webhook-event-trigger.ts"
import { db } from "@/infra/db/client.ts"
import { webhooksTable } from "@/infra/db/tables/webhooks.table.ts"
import { and, arrayContains, eq } from "drizzle-orm"

const getOrganizationWebhooksForTriggerParamsSchema = z.object({
  orgSlug: z.string(),
  trigger: webhookEventTriggerSchema,
})

type GetOrganizationWebhooksForTriggerParams = z.infer<
  typeof getOrganizationWebhooksForTriggerParamsSchema
>

export async function getOrganizationWebhooksForTrigger({
  orgSlug,
  trigger
}: GetOrganizationWebhooksForTriggerParams) {
  const webhooks = await db
    .select({ id: webhooksTable.id, url: webhooksTable.url })
    .from(webhooksTable)
    .where(
      and(
        eq(webhooksTable.organizationSlug, orgSlug),
        arrayContains(webhooksTable.triggers, [trigger]),
      ),
    )

  return webhooks
}
