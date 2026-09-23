import { describe, test, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";
import { test as authTest } from "@/lib/auth.ts";
import { inArray } from "drizzle-orm";
import { db } from "@/infra/db/client.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { makeFakeOrganization } from "@/tests/factories/make-fake-organization.ts";
import { makeFakeMember } from "@/tests/factories/make-fake-member.ts";
import { makeFakeMembers } from "@/tests/factories/make-fake-members.ts";
import { makeFakeUser } from "@/tests/factories/make-fake-user.ts";

describe("GET [/api/organizations/:slug/members/count]", () => {
  // testOrgSlug has exactly one member (testUser); anotherOrgSlug has 13.
  let anotherOrgSlug: string;
  let otherMemberIds: string[];
  let strangerId: string;
  let strangerHeaders: Record<string, string>;

  beforeAll(async () => {
    const { organizationSlug } = await makeFakeOrganization(testUser.id);
    anotherOrgSlug = organizationSlug;

    await makeFakeMember(anotherOrgSlug, testUser.id, { role: "owner" });
    ({ userIds: otherMemberIds } = await makeFakeMembers(anotherOrgSlug, 12));

    // A member of some other organization, but not of anotherOrgSlug. (With no
    // membership at all, the session hook would create an org and a Polar customer.)
    ({ userId: strangerId } = await makeFakeUser());
    const { organizationSlug: strangerOrgSlug } =
      await makeFakeOrganization(strangerId);
    await makeFakeMember(strangerOrgSlug, strangerId, { role: "owner" });
    strangerHeaders = Object.fromEntries(
      (await authTest.getAuthHeaders({ userId: strangerId })).entries(),
    );
  });

  afterAll(async () => {
    await db
      .delete(usersTable)
      .where(inArray(usersTable.id, [...otherMemberIds, strangerId]));
  });

  test("should return 200 with the total number of members of the organization", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${anotherOrgSlug}/members/count`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ count: 13 });
  });

  test("should not count members of other organizations", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/members/count`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ count: 1 });
  });

  test("should return 403 when the user is not a member of the organization", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${anotherOrgSlug}/members/count`)
      .set(strangerHeaders);

    expect(response.status).toEqual(403);
    expect(response.body).not.toHaveProperty("count");
  });

  test("should return 401 when there is no session", async () => {
    const response = await request(server.server).get(
      `/api/organizations/${anotherOrgSlug}/members/count`,
    );

    expect(response.status).toEqual(401);
  });
});
