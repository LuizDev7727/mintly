import { api } from "../api";

type GetOrganizationMetricsParams = {
  orgSlug: string;
};

export type GetOrganizationMetricsResponse = {
  metrics: {
    totalProjects: number;
    totalMembers: number;
    totalUsage: number;
  };
};

export async function getOrganizationMetricsHttp(
  params: GetOrganizationMetricsParams,
): Promise<GetOrganizationMetricsResponse> {
  const { orgSlug } = params;
  const { data } = await api.get<GetOrganizationMetricsResponse>(
    `/organizations/${orgSlug}/metrics`,
  );
  return data;
}
