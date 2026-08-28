import { api } from "../api";

type DeleteInspirationalThumbnailHttpParams = {
  orgSlug: string;
  channelId: string;
  inspirationalThumbnailId: string;
};

export async function deleteInspirationalThumbnailHttp(
  params: DeleteInspirationalThumbnailHttpParams,
): Promise<void> {
  const { orgSlug, channelId, inspirationalThumbnailId } = params;

  await api.delete(
    `/organizations/${orgSlug}/channels/${channelId}/inspirational-thumbnails/${inspirationalThumbnailId}`,
  );
}
