import { api } from "../api";

type RequestYoutubeIntegrationUrlParams = {
  channelId: string;
};

type RequestYoutubeIntegrationUrlResponse = {
  url: string;
};

export async function requestYoutubeIntegrationUrlHttp(
  params: RequestYoutubeIntegrationUrlParams,
): Promise<RequestYoutubeIntegrationUrlResponse> {
  const { channelId } = params;

  const { data } = await api.get<RequestYoutubeIntegrationUrlResponse>(
    `/channels/${channelId}/integrations/youtube/request-url`,
  );

  const { url } = data;

  return {
    url,
  };
}
