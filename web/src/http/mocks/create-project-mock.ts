import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";

type CreateProjectRequest = {
  file: {
    name: string;
    key: string;
  };
};

type CreateProjectResponse = {
  projectId: string;
};

export const createProjectMock = http.post<
  { channelId: string },
  CreateProjectRequest,
  CreateProjectResponse
>("http://localhost:3000/api/channels/:channelId/projects", () => {
  return HttpResponse.json(
    { projectId: faker.string.uuid() },
    { status: 201 },
  );
});
