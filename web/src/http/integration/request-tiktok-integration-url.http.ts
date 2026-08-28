import { api } from "../api";

type RequestTiktokIntegrationUrlParams = {
  orgSlug: string;
  channelId: string;
};

type RequestTiktokIntegrationUrlResponse = {
  url: string;
};

export async function requestTiktokIntegrationUrlHttp(
  params: RequestTiktokIntegrationUrlParams,
): Promise<RequestTiktokIntegrationUrlResponse> {
  const { orgSlug, channelId } = params;

  const { data } = await api.get<RequestTiktokIntegrationUrlResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/integrations/tiktok/request-url`,
  );

  const { url } = data;

  return {
    url,
  };
}
