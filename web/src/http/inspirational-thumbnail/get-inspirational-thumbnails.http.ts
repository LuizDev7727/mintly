import type { InspirationalThumbnail } from "@/types/inspirational-thumbnail";
import { api } from "../api";

type GetInspirationalThumbnailsHttpParams = {
  orgSlug: string;
  channelId: string;
  cursor?: string;
};

export type GetInspirationalThumbnailsHttpResponse = {
  inspirationalThumbnails: InspirationalThumbnail[];
  nextCursor: string | null;
};

export async function getInspirationalThumbnailsHttp(
  params: GetInspirationalThumbnailsHttpParams,
): Promise<GetInspirationalThumbnailsHttpResponse> {
  const { orgSlug, channelId, cursor } = params;

  const { data } = await api.get<GetInspirationalThumbnailsHttpResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/inspirational-thumbnails`,
    { params: cursor ? { cursor } : undefined },
  );

  return data;
}
