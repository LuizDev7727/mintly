import type { BestMoment } from "@/types/best-moment";
import { api } from "../api";

type GetBestMomentsHttpParams = {
  orgSlug: string;
  channelId: string;
  projectId: string;
  cursor?: string;
};

export type GetBestMomentsHttpResponse = {
  bestMoments: BestMoment[];
  nextCursor: string | null;
};

export async function getBestMomentsHttp(
  params: GetBestMomentsHttpParams,
): Promise<GetBestMomentsHttpResponse> {
  const { orgSlug, channelId, projectId, cursor } = params;

  const { data } = await api.get<GetBestMomentsHttpResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/projects/${projectId}/best-moments`,
    { params: cursor ? { cursor } : undefined },
  );

  return data;
}
