import { api } from "../api";

type DeleteChannelParams = {
  channelId: string;
};

export async function deleteChannelHttp(
  params: DeleteChannelParams,
): Promise<void> {
  const { channelId } = params;
  await api.delete(`/channels/${channelId}`);
}
