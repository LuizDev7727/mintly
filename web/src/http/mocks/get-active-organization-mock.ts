import { http, HttpResponse } from "msw";
import type { GetActiveOrganizationResponse } from "../organization/get-active-organization.http";

export const getActiveOrganizationMock = http.get<
  never,
  never,
  GetActiveOrganizationResponse
>("http://localhost:3000/api/organization/active", () => {
  return HttpResponse.json({
    organization: {
      id: "01950000-0000-7000-8000-000000000001",
      name: "Mintly",
      slug: "mintly",
      logo: null,
      billingEmail: "billing@mintly.dev",
      membersCount: 1,
    },
  });
});
