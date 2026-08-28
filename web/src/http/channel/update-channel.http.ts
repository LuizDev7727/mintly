import { api } from "../api";

type UpdateChannelParams = {
  orgSlug: string;
  id: string;
  name: string;
};

export async function updateChannelHttp(
  params: UpdateChannelParams,
): Promise<void> {
  const { orgSlug, id, name } = params;
  await api.put(`/organizations/${orgSlug}/channels/${id}`, { name });
}
