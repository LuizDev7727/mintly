import { api } from "../api";

type GetPostEventsParams = {
  orgSlug: string;
  channelId: string;
  postId: string;
};

export type PostEventStatus =
  | "ENCODED_VIDEO"
  | "ENCODED_VIDEO_FAILED"
  | "TRANSCRIBED_AUDIO"
  | "TRANSCRIBED_AUDIO_FAILED"
  | "GENERATED_METADATA"
  | "GENERATED_METADATA_FAILED"
  | "GENERATED_THUMBNAIL"
  | "GENERATED_THUMBNAIL_FAILED"
  | "PUBLISHED"
  | "PUBLISHED_FAILED";

export type GetPostEventsResponse = {
  postEvents: {
    id: string;
    status: PostEventStatus;
    createdAt: string;
  }[];
};

export async function getPostEventsHttp(
  params: GetPostEventsParams,
): Promise<GetPostEventsResponse> {
  const { orgSlug, channelId, postId } = params;

  const { data } = await api.get<GetPostEventsResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/posts/${postId}/events`,
  );

  const { postEvents } = data;

  return {
    postEvents
  };
}
