import type { Integration } from "@/types/integration";
import { api } from "../api";

type GetIntegrationsHttpParams = {
  channelId: string;
};

type GetIntegrationsResponse = {
  integrations: Integration[];
};

export async function getIntegrationsHttp(
  params: GetIntegrationsHttpParams,
): Promise<GetIntegrationsResponse> {
  const { channelId } = params;

  const { data } = await api.get<GetIntegrationsResponse>(
    `/channels/${channelId}/integrations`,
  );
  return data;
}
