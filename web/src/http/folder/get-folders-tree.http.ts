import { api } from "../api";

type GetFoldersTreeParams = {
  orgSlug: string;
  channelId: string;
};

export type FolderTreeNode = {
  id: string;
  title: string;
  parentId: string | null;
  depth: number;
  postsCount: number;
  isStarred: boolean;
  hasChildren: boolean;
};

export type GetFoldersTreeResponse = {
  folders: FolderTreeNode[];
};

export async function getFoldersTreeHttp(
  params: GetFoldersTreeParams,
): Promise<GetFoldersTreeResponse> {
  const { orgSlug, channelId } = params;
  const { data } = await api.get<GetFoldersTreeResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/folders/tree`,
  );
  return data;
}
