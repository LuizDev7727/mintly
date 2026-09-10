import { api } from "../api";

type GetSearchResultsParams = {
  orgSlug: string;
  query: string;
};

type SearchResult = {
  id: string;
  title: string;
  channelId: string;
};

export type GetSearchResultsResponse = {
  posts: SearchResult[];
  projects: SearchResult[];
  folders: SearchResult[];
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
