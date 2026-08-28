import type { Integration } from "@/types/integration";
import { api } from "../api";

type CreatePostsParams = {
  orgSlug: string;
  channelId: string;
  posts: {
    file: {
      name: string;
      key: string;
      type: string;
      size: number;
      duration: number | null;
    };
    shouldGenerateThumbnail: boolean;
    shouldGenerateShorts: boolean;
    scheduledTo: string | null;
    socialsToPost: Integration[];
  }[];
};

export async function createPostsHttp(
  params: CreatePostsParams,
) {
  const { orgSlug, channelId, posts } = params;
  const { data } = await api.post(
    `/organizations/${orgSlug}/channels/${channelId}/posts`,
    { posts },
  );
  return data;
}
