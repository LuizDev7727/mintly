import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrg } from "@/tests/setup.ts";
import { faker } from "@faker-js/faker";

let channelId: string;

beforeAll(async () => {
  const res = await request(server.server)
    .post(`/api/organizations/${testOrg.slug}/channels`)
    .set(authHeaders)
    .send({ name: faker.word.noun() });

  channelId = res.body.channelId;
});

describe("DELETE [/api/folders/:folderId]", () => {
  test("should return 204 when folder is deleted", async () => {
    const folderRes = await request(server.server)
      .post(`/api/organizations/${testOrg.slug}/channels/${channelId}/folders`)
      .set(authHeaders)
      .send({ title: faker.word.noun(), parentId: null });

    const response = await request(server.server)
      .delete(`/api/folders/${folderRes.body.folderId}`)
      .set(authHeaders);

    expect(response.status).toEqual(204);
  });

  test("should return 404 for non-existent folder", async () => {
    const response = await request(server.server)
      .delete(`/api/folders/${faker.string.uuid()}`)
      .set(authHeaders);

    expect(response.status).toEqual(404);
  });
});
