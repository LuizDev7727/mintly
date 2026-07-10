import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";
import { faker } from "@faker-js/faker";

let inviteId: string;

beforeAll(async () => {
  const response = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/invites`)
    .set(authHeaders)
    .send({ email: faker.internet.email() });

  inviteId = response.body.inviteId;
});

describe("DELETE [/api/organizations/:slug/invites/:inviteId]", () => {
  test("should return 204 when invite is revoked", async () => {
    const response = await request(server.server)
      .delete(`/api/organizations/${testOrgSlug}/invites/${inviteId}`)
      .set(authHeaders);

    expect(response.status).toEqual(204);
  });

  test("should return 404 for non-existent invite", async () => {
    const response = await request(server.server)
      .delete(
        `/api/organizations/${testOrgSlug}/invites/${faker.string.uuid()}`,
      )
      .set(authHeaders);

    expect(response.status).toEqual(404);
  });
});
