import { api } from "../api";
import type { Post } from "@/types/post";

type GetPostsParams = {
  orgSlug: string;
  channelSlug: string;
  folderId?: string;
  page?: number;
  title?: string;
  status?: Post["status"];
};

export type GetPostsResponse = {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
};

export async function getPostsHttp(
  params: GetPostsParams,
): Promise<GetPostsResponse> {
  const { orgSlug, channelSlug, folderId, page, title, status } = params;
  const { data } = await api.get<GetPostsResponse>(
    `/organizations/${orgSlug}/channels/${channelSlug}/posts`,
    { params: { folderId, page, title, status } },
  );
  return data;
}
