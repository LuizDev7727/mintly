import type { Organization } from "@/types/organization";
import { http, HttpResponse } from "msw";

export const getOrganizationsMock = http.get<never, never, Organization[]>(
  "http://localhost:3000/api/auth/organization/list",
  () => {
    return HttpResponse.json([
      {
        id: "01950000-0000-7000-8000-000000000001",
        name: "Mintly",
        slug: "mintly",
        avatar: null,
        membersCount: 0,
        billingEmail:""
      },
      {
        id: "01950000-0000-7000-8000-000000000002",
        name: "Acme Corp",
        slug: "acme-corp",
        avatar: null,
        membersCount: 0,
        billingEmail:""
      },
    ]);
  },
);
