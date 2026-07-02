import { api } from "../api";

type CreateFolderParams = {
  orgSlug: string;
  channelSlug: string;
  title: string;
  parentId: string | null;
};

export type CreateFolderResponse = {
  folderId: string;
};

export async function createFolderHttp(
  params: CreateFolderParams,
): Promise<CreateFolderResponse> {
  const { orgSlug, channelSlug, title, parentId } = params;
  const { data } = await api.post<CreateFolderResponse>(
    `/organizations/${orgSlug}/channels/${channelSlug}/folders`,
    { title, parentId },
  );
  return { folderId: data.folderId };
}
