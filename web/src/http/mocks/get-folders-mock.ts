import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import type { GetFoldersResponse } from "../folder/get-folders.http";

export const folders = Array.from({ length: 36 }, () => ({
  id: faker.string.uuid(),
  title: faker.lorem.words({ min: 1, max: 3 }),
  postsCount: faker.number.int({ min: 0, max: 120 }),
}));

export const getFoldersMock = http.get<
  { orgSlug: string; channelSlug: string },
  never,
  GetFoldersResponse
>(
  "http://localhost:3000/api/organizations/:orgSlug/channels/:channelSlug/folders",
  ({ request }) => {
    const { searchParams } = new URL(request.url);
    const folderName = searchParams.get("folderName");
    const page = Number(searchParams.get("page") ?? 1);
    const LIMIT_ITEMS_PER_PAGE = 12;

    const source = folderName
      ? Array.from({ length: 36 }, () => ({
          id: faker.string.uuid(),
          title: faker.lorem.words({ min: 1, max: 3 }),
          postsCount: faker.number.int({ min: 0, max: 120 }),
        }))
      : folders;

    const offset = (page - 1) * LIMIT_ITEMS_PER_PAGE;
    const paginated = source.slice(offset, offset + LIMIT_ITEMS_PER_PAGE);

    return HttpResponse.json({
      folders: paginated,
      meta: {
        totalCount: source.length,
        totalPages: Math.ceil(source.length / LIMIT_ITEMS_PER_PAGE),
      },
      parent: null,
    });
  },
);
