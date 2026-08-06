import type { Folder } from "@/types/folder";
import { api } from "../api";

type GetStarredFoldersParams = {
  orgSlug: string;
  channelId: string;
};

export type GetStarredFoldersResponse = {
  folders: Folder[];
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
