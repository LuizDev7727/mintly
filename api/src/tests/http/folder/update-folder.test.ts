import { faker } from "@faker-js/faker";
import request from "supertest";
import { beforeAll, describe, expect, test } from "vitest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";

let channelId: string;
let folderId: string;

beforeAll(async () => {
  const channelRes = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels`)
    .set(authHeaders)
    .send({ name: faker.word.noun(), description: faker.lorem.sentence() });

  channelId = channelRes.body.channelId;

  const folderRes = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
    .set(authHeaders)
    .send({ title: faker.word.noun(), parentId: null });

  folderId = folderRes.body.folderId;
});

describe("PUT [/api/organizations/:slug/channels/:channelId/folders/:folderId]", () => {
  test("should return 204 when title is updated", async () => {
    const response = await request(server.server)
      .put(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders/${folderId}`)
      .set(authHeaders)
      .send({ title: faker.word.noun() });

    expect(response.status).toEqual(204);
  });

  test("should return 400 when title is empty", async () => {
    const response = await request(server.server)
      .put(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders/${folderId}`)
      .set(authHeaders)
      .send({ title: "" });

    expect(response.status).toEqual(400);
  });

  test("should return 404 for non-existent folder", async () => {
    const response = await request(server.server)
      .put(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders/${faker.string.uuid()}`)
      .set(authHeaders)
      .send({ title: faker.word.noun() });

    expect(response.status).toEqual(404);
  });
});
