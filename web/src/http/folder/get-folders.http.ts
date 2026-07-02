import type { Folder } from "@/types/folder";
import { api } from "../api";

type GetFoldersParams = {
  orgSlug: string;
  channelId: string;
  folderName: string | null;
  page: number;
};

export type GetFoldersResponse = {
  folders: Folder[];
  parent: {
    id: string;
    title: string;
  } | null;
  meta: {
    totalCount: number;
    totalPages: number;
  };
};

export async function getFoldersHttp(
  params: GetFoldersParams,
): Promise<GetFoldersResponse> {
  const { orgSlug, channelId, folderName, page } = params;
  const { data } = await api.get<GetFoldersResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/folders`,
    { params: { folderName, pageIndex: page } },
  );
  const { folders, parent, meta } = data;
  return { folders, parent, meta };
}
