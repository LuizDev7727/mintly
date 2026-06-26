import { api } from "../api";

type CreateFolderParams = {
  orgSlug: string;
  channelSlug: string;
  title: string;
  parentFolderId?: string;
};

export type CreateFolderResponse = {
  folderId: string;
};

export async function createFolderHttp(
  params: CreateFolderParams,
): Promise<CreateFolderResponse> {
  const { orgSlug, channelSlug, title, parentFolderId } = params;
  const { data } = await api.post<CreateFolderResponse>(
    `/organizations/${orgSlug}/channels/${channelSlug}/folders`,
    { title, parentFolderId },
  );
  return { folderId: data.folderId };
}
