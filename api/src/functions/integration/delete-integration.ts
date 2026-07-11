import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";
import { eq } from "drizzle-orm";

type DeleteIntegrationParams = {
  integrationId: string;
}

export async function deleteIntegration(params: DeleteIntegrationParams) {
  const { integrationId } = params;

  const [integration] = await db.select().from(integrationsTable).where(eq(integrationsTable.id, integrationId))

  if (!integration) {
    throw new ResourceNotFoundError(`Integration not found: ${integrationId}`)
  };

  await db.delete(integrationsTable).where(eq(integrationsTable.id, integrationId))
}
