import { faker } from "@faker-js/faker";
import request from "supertest";
import { beforeAll, describe, expect, test } from "vitest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";

let channelId: string;

beforeAll(async () => {
  const response = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels`)
    .set(authHeaders)
    .send({ name: faker.word.noun(), description: faker.lorem.sentence() });

  channelId = response.body.channelId;
});

describe("DELETE [/api/organizations/:slug/channels/:channelId]", () => {
  test("should return 204 when channel is deleted", async () => {
    const response = await request(server.server)
      .delete(`/api/organizations/${testOrgSlug}/channels/${channelId}`)
      .set(authHeaders);

    expect(response.status).toEqual(204);
  });

  test("should return 404 for non-existent channel", async () => {
    const response = await request(server.server)
      .delete(`/api/organizations/${testOrgSlug}/channels/${faker.string.uuid()}`)
      .set(authHeaders);

    expect(response.status).toEqual(404);
  });
});
