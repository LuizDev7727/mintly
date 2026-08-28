import { api } from "../api";

type RequestInstagramIntegrationUrlParams = {
  orgSlug: string;
  channelId: string;
};

type RequestInstagramIntegrationUrlResponse = {
  url: string;
};

export async function requestInstagramIntegrationUrlHttp(
  params: RequestInstagramIntegrationUrlParams,
): Promise<RequestInstagramIntegrationUrlResponse> {
  const { orgSlug, channelId } = params;

  const { data } = await api.get<RequestInstagramIntegrationUrlResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/integrations/instagram/request-url`,
  );

  const { url } = data;

  return {
    url,
  };
}
