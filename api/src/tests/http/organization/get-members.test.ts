import { describe, test, expect } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";

describe("GET [/api/organizations/:slug/members]", () => {
  test("should return 200 with members and pendingInvites", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/members`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body.members)).toBe(true);
    expect(Array.isArray(response.body.pendingInvites)).toBe(true);
    expect(
      response.body.members.some(
        (member: { user: { id: string } }) => member.user.id === testUser.id,
      ),
    ).toBe(true);
  });
});
