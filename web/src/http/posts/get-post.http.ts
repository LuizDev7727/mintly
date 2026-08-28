import { api } from "../api";
import type { PostDetails } from "@/types/post";

type GetPostParams = {
  orgSlug: string;
  channelId: string;
  postId: string;
};

export type GetPostResponse = PostDetails;

export async function getPostHttp(
  params: GetPostParams,
): Promise<GetPostResponse> {
  const { orgSlug, channelId, postId } = params;
  const { data } = await api.get<GetPostResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/posts/${postId}`,
  );
  return data;
}
