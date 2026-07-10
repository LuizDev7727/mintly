import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";
import { faker } from "@faker-js/faker";

let folderId: string;

beforeAll(async () => {
  const channelRes = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels`)
    .set(authHeaders)
    .send({ name: faker.word.noun() });

  const folderRes = await request(server.server)
    .post(
      `/api/organizations/${testOrgSlug}/channels/${channelRes.body.channelId}/folders`,
    )
    .set(authHeaders)
    .send({ title: faker.word.noun(), parentId: null });

  folderId = folderRes.body.folderId;
});

describe("PUT [/api/folders/:folderId]", () => {
  test("should return 204 when title is updated", async () => {
    const response = await request(server.server)
      .put(`/api/folders/${folderId}`)
      .set(authHeaders)
      .send({ title: faker.word.noun() });

    expect(response.status).toEqual(204);
  });

  test("should return 400 when title is empty", async () => {
    const response = await request(server.server)
      .put(`/api/folders/${folderId}`)
      .set(authHeaders)
      .send({ title: "" });

    expect(response.status).toEqual(400);
  });

  test("should return 404 for non-existent folder", async () => {
    const response = await request(server.server)
      .put(`/api/folders/${faker.string.uuid()}`)
      .set(authHeaders)
      .send({ title: faker.word.noun() });

    expect(response.status).toEqual(404);
  });
});
