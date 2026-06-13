import { http, HttpResponse } from "msw";

type GetOrganizationMetricsResponse = {
  metrics: {
    totalProjects: number;
    totalMembers: number;
    totalUsage: number;
  };
};

export const getOrganizationMetricsMock = http.get<
  { orgSlug: string },
  never,
  GetOrganizationMetricsResponse
>("http://localhost:3000/api/organizations/:orgSlug/metrics", () => {
  return HttpResponse.json({
    metrics: {
      totalProjects: 4,
      totalMembers: 2,
      totalUsage: 200,
    },
  });
});
