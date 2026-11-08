import { api } from "../api";

type DeleteColorParams = {
  orgSlug: string;
  channelId: string;
  colorId: string;
};

export async function deleteColorHttp(params: DeleteColorParams): Promise<void> {
  const { orgSlug, channelId, colorId } = params;

  await api.delete(
    `/organizations/${orgSlug}/channels/${channelId}/colors/${colorId}`,
  );
}
