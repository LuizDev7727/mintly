import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import type { GetSearchResultsResponse } from "../search/get-search-results.http";

const RESULTS_PER_TYPE = 5;

const posts = Array.from({ length: 40 }, () => ({
  id: faker.string.uuid(),
  title: faker.lorem.words({ min: 3, max: 8 }),
  channelId: faker.string.uuid(),
}));

const projects = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  title: faker.lorem.words({ min: 2, max: 5 }),
  channelId: faker.string.uuid(),
}));

const folders = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  title: faker.lorem.words({ min: 1, max: 3 }),
  channelId: faker.string.uuid(),
}));

export const getSearchResultsMock = http.get<
  { orgSlug: string },
  never,
  GetSearchResultsResponse
>(
  "http://localhost:3000/api/organizations/:orgSlug/search",
  ({ request }) => {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase() ?? "";

    const matches = (title: string) => title.toLowerCase().includes(query);

    return HttpResponse.json({
      posts: posts.filter((post) => matches(post.title)).slice(0, RESULTS_PER_TYPE),
      projects: projects
        .filter((project) => matches(project.title))
        .slice(0, RESULTS_PER_TYPE),
      folders: folders
        .filter((folder) => matches(folder.title))
        .slice(0, RESULTS_PER_TYPE),
    });
  },
);
