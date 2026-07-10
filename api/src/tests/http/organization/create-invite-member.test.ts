import { describe, test, expect } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";
import { faker } from "@faker-js/faker";

describe("POST [/api/organizations/:slug/invites]", () => {
  test("should return 201 with inviteId", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/invites`)
      .set(authHeaders)
      .send({ email: faker.internet.email() });

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("inviteId");
    expect(typeof response.body.inviteId).toBe("string");
  });

  test("should return 400 when email is invalid", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/invites`)
      .set(authHeaders)
      .send({ email: "not-an-email" });

    expect(response.status).toEqual(400);
  });

  test("should return 400 when body is missing", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/invites`)
      .set(authHeaders)
      .send({});

    expect(response.status).toEqual(400);
  });
});
