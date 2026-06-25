import { api } from "../api";

type GetFoldersParams = {
  orgSlug: string;
  channelSlug: string;
  folderName?: string;
  page?: number;
};

export type GetFoldersResponse = {
  folders: {
    id: string;
    title: string;
    postsCount: number;
  }[];
  total: number;
  page: number;
  limit: number;
};

export async function getFoldersHttp(
  params: GetFoldersParams,
): Promise<GetFoldersResponse> {
  const { orgSlug, channelSlug, folderName, page } = params;
  const { data } = await api.get<GetFoldersResponse>(
    `/organizations/${orgSlug}/channels/${channelSlug}/folders`,
    { params: { folderName, page } },
  );
  return data;
}
