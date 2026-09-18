import { api } from "../api";

type UpdateChannelParams = {
  orgSlug: string;
  id: string;
  name: string;
  description?: string;
};

export async function updateChannelHttp(
  params: UpdateChannelParams,
): Promise<void> {
  const { orgSlug, id, name, description } = params;
  await api.put(`/organizations/${orgSlug}/channels/${id}`, {
    name,
    description,
  });
}
