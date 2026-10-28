import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";
import { and, eq } from "drizzle-orm";

type GetIntegrationForUploadParams = {
  integrationId: string;
  channelId: string;
  provider: "YOUTUBE" | "TIKTOK" | "INSTAGRAM";
};

// Devolve a integração (com os tokens) que o post deve usar para publicar. O
// provedor sozinho não basta: com mais de uma conta conectada, o post de um
// canal acabaria publicado na conta de outro.
export async function getIntegrationForUpload(
  params: GetIntegrationForUploadParams,
) {
  const { integrationId, channelId, provider } = params;

  const [integration] = await db
    .select()
    .from(integrationsTable)
    .where(
      and(
        eq(integrationsTable.id, integrationId),
        eq(integrationsTable.channelId, channelId),
        eq(integrationsTable.provider, provider),
      ),
    )
    .limit(1);

  if (!integration) {
    throw new ResourceNotFoundError(`${provider} integration not found for this channel`);
  }

  return integration;
}
