import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";
import { faker } from "@faker-js/faker";

let channelId: string;

beforeAll(async () => {
  const response = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels`)
    .set(authHeaders)
    .send({ name: faker.word.noun() });

  channelId = response.body.channelId;
});

describe("DELETE [/api/channels/:channelId]", () => {
  test("should return 204 when channel is deleted", async () => {
    const response = await request(server.server)
      .delete(`/api/channels/${channelId}`)
      .set(authHeaders);

    expect(response.status).toEqual(204);
  });

  test("should return 404 for non-existent channel", async () => {
    const response = await request(server.server)
      .delete(`/api/channels/${faker.string.uuid()}`)
      .set(authHeaders);

    expect(response.status).toEqual(404);
  });
});
