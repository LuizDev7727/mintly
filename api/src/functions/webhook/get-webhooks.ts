import { db } from "@/infra/db/client.ts";
import { webhooksTable } from "@/infra/db/tables/webhooks.table.ts";
import { eq } from "drizzle-orm";

type GetWebhooksParams = {
  orgSlug: string;
}

export async function getWebhooks(params: GetWebhooksParams) {

  const { orgSlug } = params;


  const webhooks = await db
    .select()
    .from(webhooksTable)
    .where(
      eq(webhooksTable.organizationSlug, orgSlug)
    )

  return {
    webhooks
  };
}
