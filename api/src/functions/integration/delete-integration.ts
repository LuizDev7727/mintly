import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";
import { and, eq } from "drizzle-orm";

type DeleteIntegrationParams = {
  channelId: string;
  integrationId: string;
}

export async function deleteIntegration(params: DeleteIntegrationParams) {
  const { channelId, integrationId } = params;

  // O id sozinho não basta: a integração precisa ser do canal da URL.
  const ownedByChannel = and(
    eq(integrationsTable.id, integrationId),
    eq(integrationsTable.channelId, channelId),
  );

  const [integration] = await db.select().from(integrationsTable).where(ownedByChannel)

  if (!integration) {
    throw new ResourceNotFoundError(`Integration not found: ${integrationId}`)
  };

  await db.delete(integrationsTable).where(ownedByChannel)
}
