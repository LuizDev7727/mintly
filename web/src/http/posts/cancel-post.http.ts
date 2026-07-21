import { api } from "../api";

type CancelPostHttpParams = {
  postId: string;
  runId: string;
};

export async function cancelPostHttp(
  params: CancelPostHttpParams,
): Promise<void> {
  const { postId, runId } = params;
  await api.put(`/posts/${postId}/cancel`, { runId });
}
