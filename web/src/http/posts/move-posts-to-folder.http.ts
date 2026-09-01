import { api } from "../api";

type MovePostsToFolderParams = {
  orgSlug: string;
  channelId: string;
  postIds: string[];
  folderId: string | null;
};

export async function movePostsToFolderHttp(
  params: MovePostsToFolderParams,
): Promise<void> {
  const { orgSlug, channelId, postIds, folderId } = params;
  await api.put(
    `/organizations/${orgSlug}/channels/${channelId}/posts/move-to-folder`,
    { postIds, folderId },
  );
}
