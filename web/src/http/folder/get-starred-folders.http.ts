import { api } from "../api";

type GetStarredFoldersParams = {
  orgSlug: string;
  channelId: string;
};

type StarredFolder = {
  id: string;
  title: string;
  postsCount: number;
};

export type GetStarredFoldersResponse = {
  folders: StarredFolder[];
};

export async function getStarredFoldersHttp(
  params: GetStarredFoldersParams,
): Promise<GetStarredFoldersResponse> {
  const { orgSlug, channelId } = params;
  const { data } = await api.get<GetStarredFoldersResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/starred-folders`,
  );
  return data;
}
