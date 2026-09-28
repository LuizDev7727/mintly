import { api } from "../api";

type GetSearchResultsParams = {
  orgSlug: string;
  query: string;
};

export type PostSearchResult = {
  id: string;
  title: string;
  channelId: string;
  thumbnailUrl: string | null;
  description: string;
};

export type ProjectSearchResult = {
  id: string;
  title: string;
  channelId: string;
  thumbnailUrl: string | null;
};

export type FolderSearchResult = {
  id: string;
  title: string;
  channelId: string;
};

export type GetSearchResultsResponse = {
  posts: PostSearchResult[];
  projects: ProjectSearchResult[];
  folders: FolderSearchResult[];
};

export async function getSearchResultsHttp(
  params: GetSearchResultsParams,
): Promise<GetSearchResultsResponse> {
  const { orgSlug, query } = params;
  const { data } = await api.get<GetSearchResultsResponse>(
    `/organizations/${orgSlug}/search`,
    { params: { query } },
  );
  return data;
}
