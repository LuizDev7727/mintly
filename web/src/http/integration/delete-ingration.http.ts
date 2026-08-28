import { api } from "../api";

type DeleteIntegrationHttpParams = {
  orgSlug: string;
  channelId: string;
  integrationId: string;
};

export async function deleteIntegrationHttp(
  params: DeleteIntegrationHttpParams,
): Promise<void> {
  const { orgSlug, channelId, integrationId } = params;

  await api.delete(
    `/organizations/${orgSlug}/channels/${channelId}/integrations/${integrationId}`,
  );
}
