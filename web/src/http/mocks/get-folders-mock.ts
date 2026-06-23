import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import type { GetFoldersResponse } from "../folder/get-folders.http";

export const folders = Array.from({ length: 12 }, () => ({
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

    const subfolders = folderName
      ? Array.from({ length: faker.number.int({ min: 5, max: 10 }) }, () => ({
          id: faker.string.uuid(),
          title: faker.lorem.words({ min: 1, max: 3 }),
          postsCount: faker.number.int({ min: 0, max: 120 }),
        }))
      : folders;

    return HttpResponse.json({ folders: subfolders });
  },
);
