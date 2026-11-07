import { HttpResponse, http } from "msw";
import type { GetOrganizationsResponse } from "../organization/get-organizations.http";

export const getOrganizationsMock = http.get<never, never, GetOrganizationsResponse>(
  "http://localhost:3000/api/organizations",
  () => {
    return HttpResponse.json({
      organizations: [
        {
          id: "01950000-0000-7000-8000-000000000001",
          name: "Mintly",
          slug: "mintly",
          membersCount: 0,
        },
        {
          id: "01950000-0000-7000-8000-000000000002",
          name: "Acme Corp",
          slug: "acme-corp",
          membersCount: 0,
        },
      ],
    });
  },
);
