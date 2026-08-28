import { api } from "../api";

type UpdateFolderParams = {
  orgSlug: string;
  channelId: string;
  folderId: string;
  title: string;
};

export async function updateFolderHttp(params: UpdateFolderParams): Promise<void> {
  const { orgSlug, channelId, folderId, title } = params;
  await api.put(
    `/organizations/${orgSlug}/channels/${channelId}/folders/${folderId}`,
    { title },
  );
}
