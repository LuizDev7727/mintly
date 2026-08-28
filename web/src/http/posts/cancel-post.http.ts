import { api } from "../api";

type CancelPostHttpParams = {
  orgSlug: string;
  channelId: string;
  postId: string;
  runId: string;
};

export async function cancelPostHttp(
  params: CancelPostHttpParams,
): Promise<void> {
  const { orgSlug, channelId, postId, runId } = params;
  await api.put(
    `/organizations/${orgSlug}/channels/${channelId}/posts/${postId}/cancel`,
    { runId },
  );
}
