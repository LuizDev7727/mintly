import { api } from "../api";

type GetUsageParams = {
  orgSlug: string;
  startDate: Date;
  endDate: Date;
};

export type GetUsageResponse = {
  costs: {
    currentCents: number;
    previousCents: number;
    changePercentage: number;
  };
  storage: {
    currentBytes: number;
    previousBytes: number;
    changePercentage: number;
  };
  series: {
    date: string;
    clipRendered: number;
    thumbnailGenerated: number;
    seoGenerated: number;
    audioTranscribed: number;
    bestMomentsGenerated: number;
  }[];
  storageSeries: {
    date: string;
    storage: number;
  }[];
};

export async function getUsageHttp(
  params: GetUsageParams,
): Promise<GetUsageResponse> {
  const { orgSlug, startDate, endDate } = params;
  const { data } = await api.get<GetUsageResponse>(
    `/organizations/${orgSlug}/usage`,
    {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    },
  );
  return data;
}
