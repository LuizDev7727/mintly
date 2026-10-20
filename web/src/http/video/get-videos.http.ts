import { api } from "../api";
import type { Video } from "@/types/video";

type GetVideosParams = {
  orgSlug: string;
  channelId: string;
  pageIndex?: number;
};

export type GetVideosResponse = {
  videos: Video[];
  meta: {
    totalCount: number;
    totalPages: number;
  };
};

export async function getVideosHttp(
  params: GetVideosParams,
): Promise<GetVideosResponse> {
  const { orgSlug, channelId, pageIndex } = params;
  const { data } = await api.get<GetVideosResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/videos`,
    { params: { pageIndex } },
  );
  return data;
}
