import { api } from "../api";

type SetStarredFolderParams = {
  orgSlug: string;
  channelId: string;
  folderId: string;
};

export type SetStarredFolderResponse = {
  starredFolderId: string;
};

export async function setStarredFolderHttp(
  params: SetStarredFolderParams,
): Promise<SetStarredFolderResponse> {
  const { orgSlug, channelId, folderId } = params;
  const { data } = await api.post<SetStarredFolderResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/starred-folders`,
    { folderId },
  );
  return data;
}
