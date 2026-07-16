import type { BestMoment } from "@/types/best-moment";
import { api } from "../api";

type GetBestMomentsHttpParams = {
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
  const { projectId, cursor } = params;

  const { data } = await api.get<GetBestMomentsHttpResponse>(
    `/projects/${projectId}/best-moments`,
    { params: cursor ? { cursor } : undefined },
  );

  return data;
}
