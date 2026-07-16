import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";
import { faker } from "@faker-js/faker";
import { uuidv7 } from "uuidv7";
import { makeFakeProject } from "@/tests/factories/make-fake-project.ts";

let channelId: string;
let projectTitle: string;

beforeAll(async () => {
  const channelRes = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels`)
    .set(authHeaders)
    .send({ name: faker.word.noun() });

  channelId = channelRes.body.channelId;

  projectTitle = faker.lorem.words({ min: 3, max: 8 });
  await makeFakeProject(channelId, testUser.id, { title: projectTitle });
  await makeFakeProject(channelId, testUser.id);
});

describe("GET [/api/organizations/:orgSlug/channels/:channelId/projects]", () => {
  test("should return 200 with projects array and pagination meta", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${channelId}/projects`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body.projects)).toBe(true);
    expect(response.body.projects.length).toBeGreaterThanOrEqual(2);
    expect(response.body.meta).toHaveProperty("totalCount");
    expect(response.body.meta).toHaveProperty("totalPages");
  });

  test("should filter projects by title", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${channelId}/projects`)
      .query({ titleFilter: projectTitle })
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body.projects).toHaveLength(1);
    expect(response.body.projects[0].title).toBe(projectTitle);
  });

  test("should return 404 when channel does not exist", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${uuidv7()}/projects`)
      .set(authHeaders);

    expect(response.status).toEqual(404);
  });
});
