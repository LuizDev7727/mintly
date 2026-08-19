import { db } from "@/infra/db/client.ts"
import {
  webhooksTable,
  type WebhookEventTrigger,
} from "@/infra/db/tables/webhooks.table.ts"
import { generateSigningKey } from "@/utils/generate-signing-key.ts";

type CreateWebhookParams = {
  orgSlug: string,
  url: string,
  triggers: WebhookEventTrigger[],
}

type CreateWebhookResponse = {
  id: string
  signingKey: string
}

export async function createWebhook(
  params: CreateWebhookParams,
): Promise<CreateWebhookResponse> {

  const { url, triggers, orgSlug } = params;

  const signingKey = generateSigningKey()

  const [{ id }] = await db
    .insert(webhooksTable)
    .values({
      url,
      triggers,
      organizationSlug: orgSlug,
      signingKey,
    }).returning({ id: webhooksTable.id })

  return {
    id,
    signingKey,
  }
}
