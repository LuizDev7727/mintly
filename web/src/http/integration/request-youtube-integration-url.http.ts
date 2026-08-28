import { api } from "../api";

type RequestYoutubeIntegrationUrlParams = {
  orgSlug: string;
  channelId: string;
};

type RequestYoutubeIntegrationUrlResponse = {
  url: string;
};

export async function requestYoutubeIntegrationUrlHttp(
  params: RequestYoutubeIntegrationUrlParams,
): Promise<RequestYoutubeIntegrationUrlResponse> {
  const { orgSlug, channelId } = params;

  const { data } = await api.get<RequestYoutubeIntegrationUrlResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/integrations/youtube/request-url`,
  );

  const { url } = data;

  return {
    url,
  };
}
