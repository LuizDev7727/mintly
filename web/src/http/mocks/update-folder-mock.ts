import { http, HttpResponse } from "msw";

type UpdateFolderMockParams = {
  folderId: string;
};

type UpdateFolderMockRequest = {
  title: string;
};

export const updateFolderMock = http.put<
  UpdateFolderMockParams,
  UpdateFolderMockRequest,
  never
>(
  "http://localhost:3000/api/folders/:folderId",
  () => {
    return new HttpResponse(null, { status: 204 });
  },
);
