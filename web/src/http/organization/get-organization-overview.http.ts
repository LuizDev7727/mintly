import type { Webhook } from "@/types/webhook";
import { api } from "../api";
import type { Activity } from "@/types/activity";

type GetOrganizationOverviewParams = {
  orgSlug: string;
};

export type GetOrganizationOverviewResponse = {
  overview: {
    channelsCount: number;
    membersCount: number;
    usage: {
      totalUsage: number;
      series: number[];
    };
    storage: {
      totalStorage: number;
      series: number[];
    };
    channels: {
      id: string;
      name: string;
      totalPosts: number;
    }[];
    recentActivities: Activity[];
    webhooks: Webhook[];
  };
};

export async function getOrganizationOverviewHttp(
  params: GetOrganizationOverviewParams,
): Promise<GetOrganizationOverviewResponse> {
  const { orgSlug } = params;
  const { data } = await api.get<GetOrganizationOverviewResponse>(
    `/organizations/${orgSlug}/overview`,
  );
  return data;
}
