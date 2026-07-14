import { api } from "../api";

type CreatePostsParams = {
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
    socialsToPost: {
      id: string;
      name: string;
      provider: "YOUTUBE" | "TIKTOK";
    }[];
  }[];
};

export async function createPostsHttp(
  params: CreatePostsParams,
) {
  const { channelId, posts } = params;
  const { data } = await api.post(
    `/channels/${channelId}/posts`,
    { posts },
  );
  return data;
}
