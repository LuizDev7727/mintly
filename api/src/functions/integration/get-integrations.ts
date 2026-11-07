import { eq } from "drizzle-orm";
import { db } from "@/infra/db/client.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";

type GetIntegrationsParams = {
  channelId: string;
};

export async function getIntegrations(params: GetIntegrationsParams) {
  const { channelId } = params;
  const integrations = await db
    .select({
      id: integrationsTable.id,
      name: integrationsTable.name,
      avatarUrl: integrationsTable.avatarUrl,
      provider: integrationsTable.provider,
    })
    .from(integrationsTable)
    .where(eq(integrationsTable.channelId, channelId));

  return {
    integrations,
  };
}
