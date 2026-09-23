import { http, HttpResponse } from "msw";

type CreateProjectRequest = {
  files: {
    name: string;
    key: string;
  }[];
};

export const createProjectMock = http.post<
  { channelId: string },
  CreateProjectRequest,
  never
>("http://localhost:3000/api/channels/:channelId/projects", () => {
  return new HttpResponse(null, { status: 201 });
});
