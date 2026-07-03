import { api } from "../api";

type GetChannelParams = {
  channelId: string;
};

export type GetChannelResponse = {
  id: string;
  name: string;
};

export async function getChannelHttp(
  params: GetChannelParams,
): Promise<GetChannelResponse> {
  const { channelId } = params;
  const { data } = await api.get<GetChannelResponse>(`/channels/${channelId}`);
  return data;
}
