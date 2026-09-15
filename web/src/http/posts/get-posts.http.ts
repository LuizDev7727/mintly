import { api } from "../api";
import type { Post } from "@/types/post";

type GetPostsParams = {
  orgSlug: string;
  channelSlug: string;
  folderId: string | null;
  pageIndex: number;
  titleFilter: string | null;
  statusFilter: Post["status"] | null;
  ownerId: string | null;
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
  const { orgSlug, channelSlug, folderId, pageIndex, titleFilter, statusFilter, ownerId } =
    params;
  const { data } = await api.get<GetPostsResponse>(
    `/organizations/${orgSlug}/channels/${channelSlug}/posts`,
    { params: { folderId, pageIndex, titleFilter, statusFilter, ownerId } },
  );
  return data;
}
