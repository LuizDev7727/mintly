import { api } from "../api";

type RequestYoutubeIntegrationUrlParams = {
  orgSlug: string;
  channelId: string;
  source?: "onboarding";
};

type RequestYoutubeIntegrationUrlResponse = {
  url: string;
};

export async function requestYoutubeIntegrationUrlHttp(
  params: RequestYoutubeIntegrationUrlParams,
): Promise<RequestYoutubeIntegrationUrlResponse> {
  const { orgSlug, channelId, source } = params;

  const { data } = await api.get<RequestYoutubeIntegrationUrlResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/integrations/youtube/request-url`,
    { params: { source } },
  );

  const { url } = data;

  return {
    url,
  };
}
