import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import type { CreateFolderResponse } from "../folder/create-folder.http";

type CreateFolderMockParams = {
  orgSlug: string;
  channelSlug: string;
};

type CreateFolderMockRequest = {
  title: string;
  parentFolderId?: string;
};

export const createFolderMock = http.post<
  CreateFolderMockParams,
  CreateFolderMockRequest,
  CreateFolderResponse
>(
  "http://localhost:3000/api/organizations/:orgSlug/channels/:channelSlug/folders",
  () => {
    return HttpResponse.json(
      { folderId: faker.string.uuid() },
      { status: 201 },
    );
  },
);
