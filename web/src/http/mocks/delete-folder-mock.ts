import { http, HttpResponse } from "msw";

export const deleteFolderMock = http.delete<{ folderId: string }, never, never>(
  "http://localhost:3000/api/folders/:folderId",
  () => {
    return new HttpResponse(null, { status: 204 });
  },
);
