import { api } from "../api";

type GetChannelParams = {
  orgSlug: string;
  channelId: string;
};

export type GetChannelResponse = {
  id: string;
  name: string;
};

export async function getChannelHttp(
  params: GetChannelParams,
): Promise<GetChannelResponse> {
  const { orgSlug, channelId } = params;
  const { data } = await api.get<GetChannelResponse>(
    `/organizations/${orgSlug}/channels/${channelId}`,
  );
  return data;
}
