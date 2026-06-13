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
        id: "1",
        name: "asdasd",
        slug: "asd",
        avatar: null,
      },
      {
        id: "2",
        name: "asdasdasd",
        slug: "asdasd",
        avatar: null,
      },
      {
        id: "3",
        name: "asdasd",
        slug: "asdasdasd",
        avatar: null,
      },
      {
        id: "4",
        name: "asdasdasdasd",
        slug: "asdasdasdasd",
        avatar: null,
      },
      {
        id: "5",
        name: "asdasdasdasdasd",
        slug: "asdasdasdasdasd",
        avatar: null,
      },
      {
        id: "6",
        name: "asdasdasdasdas",
        slug: "asdasdasd",
        avatar: null,
      },
    ],
  });
});
