import { api } from "../api";

type RequestInstagramIntegrationUrlParams = {
  channelId: string;
};

type RequestInstagramIntegrationUrlResponse = {
  url: string;
};

export async function requestInstagramIntegrationUrlHttp(
  params: RequestInstagramIntegrationUrlParams,
): Promise<RequestInstagramIntegrationUrlResponse> {
  const { channelId } = params;

  const { data } = await api.get<RequestInstagramIntegrationUrlResponse>(
    `/channels/${channelId}/integrations/instagram/request-url`,
  );

  const { url } = data;

  return {
    url,
  };
}
