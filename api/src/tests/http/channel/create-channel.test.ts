import { describe, test, expect } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";
import { faker } from "@faker-js/faker";

describe("POST [/api/organizations/:orgSlug/channels]", () => {
  test("should return 201 with channelId", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels`)
      .set(authHeaders)
      .send({ name: faker.word.noun() });

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("channelId");
    expect(typeof response.body.channelId).toBe("string");
  });

  test("should return 400 when name is empty", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels`)
      .set(authHeaders)
      .send({ name: "" });

    expect(response.status).toEqual(400);
  });

  test("should return 400 when body is missing", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels`)
      .set(authHeaders)
      .send({});

    expect(response.status).toEqual(400);
  });
});
