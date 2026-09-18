import { api } from "../api";

type CreateChannelParams = {
  org: string;
  name: string;
  description: string;
};

export type CreateChannelResponse = {
  channelId: string;
};

export async function createChannelHttp(params: CreateChannelParams) {
  const { org, name, description } = params;
  const { data } = await api.post<CreateChannelResponse>(
    `/organizations/${org}/channels`,
    { name, description },
  );

  const { channelId } = data;
  return { channelId };
}
