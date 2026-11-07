import { and, arrayContains, eq } from "drizzle-orm";
import { db } from "@/infra/db/client.ts";
import { type WebhookEventTrigger, webhooksTable } from "@/infra/db/tables/webhooks.table.ts";

type GetWebhooksForTriggerParams = {
  orgSlug: string;
  trigger: WebhookEventTrigger;
};

type WebhookForTrigger = {
  id: string;
  url: string;
  signingKey: string;
};

type GetWebhooksForTriggerResponse = {
  webhooks: WebhookForTrigger[];
};

export async function getWebhooksForTrigger(
  params: GetWebhooksForTriggerParams,
): Promise<GetWebhooksForTriggerResponse> {
  const { orgSlug, trigger } = params;

  const webhooks = await db
    .select({
      id: webhooksTable.id,
      url: webhooksTable.url,
      signingKey: webhooksTable.signingKey,
    })
    .from(webhooksTable)
    .where(
      and(
        eq(webhooksTable.organizationSlug, orgSlug),
        arrayContains(webhooksTable.triggers, [trigger]),
      ),
    );

  return { webhooks };
}
