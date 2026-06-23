import { api } from "../api";

type GetFoldersParams = {
  orgSlug: string;
  channelSlug: string;
  folderName?: string;
};

export type GetFoldersResponse = {
  folders: {
    id: string;
    title: string;
    postsCount: number;
  }[];
};

export async function getFoldersHttp(
  params: GetFoldersParams,
): Promise<GetFoldersResponse> {
  const { orgSlug, channelSlug, folderName } = params;
  const { data } = await api.get<GetFoldersResponse>(
    `/organizations/${orgSlug}/channels/${channelSlug}/folders`,
    { params: { folderName } },
  );
  return data;
}
