import type { GetProjectsResponse } from "../get-projects.http";
import { http, HttpResponse } from "msw";

export const getProjectsMock = http.get<
  { orgSlug: string },
  never,
  GetProjectsResponse
>("http://localhost:3000/api/organizations/:orgSlug/projects", () => {
  return HttpResponse.json({
    projects: [
      {
        id: "01950000-0000-7000-8000-000000000011",
        name: "Website Redesign",
        slug: "website-redesign",
        avatar: null,
      },
      {
        id: "01950000-0000-7000-8000-000000000012",
        name: "Mobile App",
        slug: "mobile-app",
        avatar: null,
      },
      {
        id: "01950000-0000-7000-8000-000000000013",
        name: "API Integration",
        slug: "api-integration",
        avatar: null,
      },
    ],
  });
});
