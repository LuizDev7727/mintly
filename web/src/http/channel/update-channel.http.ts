import { api } from "../api";

type UpdateChannelParams = {
  id: string;
  name: string;
};

export async function updateChannelHttp(
  params: UpdateChannelParams,
): Promise<void> {
  const { id, name } = params;
  await api.put(`/channels/${id}`, { name });
}
