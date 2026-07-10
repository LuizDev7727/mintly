import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";

beforeAll(async () => {
  await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/invites`)
    .set(authHeaders)
    .send({ email: testUser.email });
});

describe("GET [/api/invitations/pending]", () => {
  test("should return 200 with the pending invites for the user", async () => {
    const response = await request(server.server)
      .get("/api/invitations/pending")
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("invites");
    expect(Array.isArray(response.body.invites)).toBe(true);
    expect(
      response.body.invites.some(
        (invite: { organization: { slug: string } }) =>
          invite.organization.slug === testOrgSlug,
      ),
    ).toBe(true);
  });
});
