import { api } from "../api";
import type { Post } from "@/types/post";

type GetPostsParams = {
  orgSlug: string;
  channelSlug: string;
  folderId: string | null;
  page?: number;
  titleFilter: string | null;
  status?: Post["status"];
};

export type GetPostsResponse = {
  posts: Post[];
  meta: {
    totalCount: number;
    totalPages: number;
  };
};

export async function getPostsHttp(
  params: GetPostsParams,
): Promise<GetPostsResponse> {
  const { orgSlug, channelSlug, folderId, page, titleFilter, status } = params;
  const { data } = await api.get<GetPostsResponse>(
    `/organizations/${orgSlug}/channels/${channelSlug}/posts`,
    { params: { folderId, page, titleFilter, status } },
  );
  return data;
}
