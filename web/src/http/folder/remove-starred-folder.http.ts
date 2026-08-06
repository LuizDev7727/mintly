import { api } from "../api";

type RemoveStarredFolderParams = {
  orgSlug: string;
  channelId: string;
  folderId: string;
};

export async function removeStarredFolderHttp(
  params: RemoveStarredFolderParams,
): Promise<void> {
  const { orgSlug, channelId, folderId } = params;
  await api.delete(
    `/organizations/${orgSlug}/channels/${channelId}/starred-folders/${folderId}`,
  );
}
