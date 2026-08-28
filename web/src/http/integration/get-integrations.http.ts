import type { Integration } from "@/types/integration";
import { api } from "../api";

type GetIntegrationsHttpParams = {
  orgSlug: string;
  channelId: string;
};

type GetIntegrationsResponse = {
  integrations: Integration[];
};

export async function getIntegrationsHttp(
  params: GetIntegrationsHttpParams,
): Promise<GetIntegrationsResponse> {
  const { orgSlug, channelId } = params;

  const { data } = await api.get<GetIntegrationsResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/integrations`,
  );
  return data;
}
