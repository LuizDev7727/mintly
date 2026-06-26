import { api } from "../api";

type CreateChannelParams = {
  org: string;
  name: string;
};

export type CreateChannelResponse = {
  channelId: string;
};

export async function createChannelHttp(params: CreateChannelParams) {
  const { org, name } = params;
  const { data } = await api.post<CreateChannelResponse>(
    `/organizations/${org}/channels`,
    { name },
  );

  const { channelId } = data;
  return { channelId };
}
