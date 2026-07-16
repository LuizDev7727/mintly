import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import type { GetProjectsResponse } from "../projects/get-projects.http";
import type { Project } from "@/types/project";

const STATUSES: Project["status"][] = [
  "SUCCESS",
  "PROCESSING",
  "SCHEDULED",
  "ERROR",
  "CANCELED",
];

const projects: Project[] = Array.from({ length: 24 }, () => ({
  id: faker.string.uuid(),
  title: faker.lorem.words({ min: 3, max: 8 }),
  thumbnailUrl: faker.datatype.boolean()
    ? faker.image.urlPicsumPhotos({ width: 1280, height: 720 })
    : null,
  status: faker.helpers.arrayElement(STATUSES),
  createdAt: faker.date.past().toISOString(),
  clipCount: faker.number.int({ min: 0, max: 20 }),
  owner: {
    name: faker.person.fullName(),
    avatarUrl: null,
  },
}));

export const getProjectsMock = http.get<
  { orgSlug: string; channelId: string },
  never,
  GetProjectsResponse
>(
  "http://localhost:3000/api/organizations/:orgSlug/channels/:channelId/projects",
  ({ request }) => {
    const { searchParams } = new URL(request.url);
    const pageIndex = Number(searchParams.get("pageIndex") ?? 0);
    const titleFilter = searchParams.get("titleFilter")?.toLowerCase() ?? "";
    const pageSize = 12;

    const filtered = titleFilter
      ? projects.filter((project) =>
          project.title.toLowerCase().includes(titleFilter),
        )
      : projects;

    const offset = pageIndex * pageSize;
    const paginated = filtered.slice(offset, offset + pageSize);

    return HttpResponse.json({
      projects: paginated,
      meta: {
        totalCount: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    });
  },
);
