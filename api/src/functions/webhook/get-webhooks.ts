import { eq } from "drizzle-orm";
import { db } from "@/infra/db/client.ts";
import { webhooksTable } from "@/infra/db/tables/webhooks.table.ts";

type GetWebhooksParams = {
  orgSlug: string;
};

export async function getWebhooks(params: GetWebhooksParams) {
  const { orgSlug } = params;

  const webhooks = await db
    .select()
    .from(webhooksTable)
    .where(eq(webhooksTable.organizationSlug, orgSlug));

  return {
    webhooks,
  };
}
