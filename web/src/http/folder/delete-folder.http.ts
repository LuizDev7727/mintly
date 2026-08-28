import { api } from "../api";

type DeleteFolderParams = {
  orgSlug: string;
  channelId: string;
  folderId: string;
};

export async function deleteFolderHttp(params: DeleteFolderParams): Promise<void> {
  const { orgSlug, channelId, folderId } = params;
  await api.delete(
    `/organizations/${orgSlug}/channels/${channelId}/folders/${folderId}`,
  );
}
