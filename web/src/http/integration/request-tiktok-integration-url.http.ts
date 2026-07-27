import { api } from "../api";

type RequestTiktokIntegrationUrlParams = {
  channelId: string;
};

type RequestTiktokIntegrationUrlResponse = {
  url: string;
};

export async function requestTiktokIntegrationUrlHttp(
  params: RequestTiktokIntegrationUrlParams,
): Promise<RequestTiktokIntegrationUrlResponse> {
  const { channelId } = params;

  const { data } = await api.get<RequestTiktokIntegrationUrlResponse>(
    `/channels/${channelId}/integrations/tiktok/request-url`,
  );

  const { url } = data;

  return {
    url,
  };
}
