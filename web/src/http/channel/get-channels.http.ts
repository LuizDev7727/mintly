import type { Channel } from "@/types/channel";
import { api } from "../api";

type GetChannelsParams = {
  orgSlug: string;
};

export type GetChannelsResponse = {
  channels: Channel[];
};

export async function getChannelsHttp(
  params: GetChannelsParams,
): Promise<GetChannelsResponse> {
  const { orgSlug } = params;
  const { data } = await api.get<GetChannelsResponse>(
    `/organizations/${orgSlug}/channels`,
  );

  const { channels } = data;
  return { channels };
}
