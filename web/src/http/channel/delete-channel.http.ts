import { api } from "../api";

type DeleteChannelParams = {
  orgSlug: string;
  channelId: string;
};

export async function deleteChannelHttp(
  params: DeleteChannelParams,
): Promise<void> {
  const { orgSlug, channelId } = params;
  await api.delete(`/organizations/${orgSlug}/channels/${channelId}`);
}
