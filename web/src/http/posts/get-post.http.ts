import { api } from "../api";
import type { PostDetails } from "@/types/post";

type GetPostParams = {
  postId: string;
};

export type GetPostResponse = PostDetails;

export async function getPostHttp(
  params: GetPostParams,
): Promise<GetPostResponse> {
  const { postId } = params;
  const { data } = await api.get<GetPostResponse>(`/posts/${postId}`);
  return data;
}
