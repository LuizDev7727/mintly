import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";
import { faker } from "@faker-js/faker";

let inviteId: string;

beforeAll(async () => {
  const response = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/invites`)
    .set(authHeaders)
    .send({ email: testUser.email });

  inviteId = response.body.inviteId;
});

describe("POST [/api/invitations/:inviteId/decline]", () => {
  test("should return 204 when invite is declined", async () => {
    const response = await request(server.server)
      .post(`/api/invitations/${inviteId}/decline`)
      .set(authHeaders);

    expect(response.status).toEqual(204);
  });

  test("should return 404 for non-existent invite", async () => {
    const response = await request(server.server)
      .post(`/api/invitations/${faker.string.uuid()}/decline`)
      .set(authHeaders);

    expect(response.status).toEqual(404);
  });

  test("should return 403 when invite email does not match the user", async () => {
    const inviteResponse = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/invites`)
      .set(authHeaders)
      .send({ email: faker.internet.email() });

    const response = await request(server.server)
      .post(`/api/invitations/${inviteResponse.body.inviteId}/decline`)
      .set(authHeaders);

    expect(response.status).toEqual(403);
  });
});
