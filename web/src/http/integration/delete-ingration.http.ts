import { api } from "../api";

type DeleteIntegrationHttpParams = {
  integrationId: string;
};

export async function deleteIntegrationHttp(
  params: DeleteIntegrationHttpParams,
): Promise<void> {
  const { integrationId } = params;

  await api.delete(`/integrations/${integrationId}`);
}
