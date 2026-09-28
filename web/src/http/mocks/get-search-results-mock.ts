import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import type { GetSearchResultsResponse } from "../search/get-search-results.http";

const RESULTS_PER_TYPE = 5;

const THUMBNAIL_URLS = [
  "https://pub-2f07862307a848f6a37eefd05ab02ea6.r2.dev/mr-beast-thumb.webp",
  "https://pub-2f07862307a848f6a37eefd05ab02ea6.r2.dev/mr-beast-thumb-2.webp",
  "https://pub-2f07862307a848f6a37eefd05ab02ea6.r2.dev/mr-beast-thumb-3.webp",
  "https://pub-2f07862307a848f6a37eefd05ab02ea6.r2.dev/mr-beast-thumb-4.webp",
];

function pickThumbnailUrl(index: number) {
  return THUMBNAIL_URLS[index % THUMBNAIL_URLS.length];
}

const posts = Array.from({ length: 40 }, (_, index) => ({
  id: faker.string.uuid(),
  title: faker.lorem.words({ min: 3, max: 8 }),
  channelId: faker.string.uuid(),
  thumbnailUrl: pickThumbnailUrl(index),
  description: faker.lorem.sentence(),
}));

const projects = Array.from({ length: 20 }, (_, index) => ({
  id: faker.string.uuid(),
  title: faker.lorem.words({ min: 2, max: 5 }),
  channelId: faker.string.uuid(),
  thumbnailUrl: pickThumbnailUrl(index),
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
