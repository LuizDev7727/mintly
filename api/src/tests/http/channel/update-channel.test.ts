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

describe("PUT [/api/channels/:channelId]", () => {
  test("should return 204 when name is updated", async () => {
    const response = await request(server.server)
      .put(`/api/channels/${channelId}`)
      .set(authHeaders)
      .send({ name: faker.word.noun() });

    expect(response.status).toEqual(204);
  });

  test("should return 400 when name is empty", async () => {
    const response = await request(server.server)
      .put(`/api/channels/${channelId}`)
      .set(authHeaders)
      .send({ name: "" });

    expect(response.status).toEqual(400);
  });

  test("should return 404 for non-existent channel", async () => {
    const response = await request(server.server)
      .put(`/api/channels/${faker.string.uuid()}`)
      .set(authHeaders)
      .send({ name: faker.word.noun() });

    expect(response.status).toEqual(404);
  });
});
