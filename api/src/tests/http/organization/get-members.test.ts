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

describe("GET [/api/organizations/:slug/members]", () => {
  test("should return 200 with the members array, no pendingInvites", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/members`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body.members)).toBe(true);
    expect(response.body).not.toHaveProperty("pendingInvites");
    expect(
      response.body.members.some(
        (member: { user: { id: string } }) => member.user.id === testUser.id,
      ),
    ).toBe(true);
  });
});

describe("GET [/api/organizations/:slug/members] with pagination", () => {
  // 13 members = one full page of 12 plus one. testUser is the oldest.
  let pagedOrgSlug: string;
  let otherMemberIds: string[];
  let strangerId: string;
  let strangerHeaders: Record<string, string>;

  beforeAll(async () => {
    const { organizationSlug } = await makeFakeOrganization(testUser.id);
    pagedOrgSlug = organizationSlug;

    await makeFakeMember(pagedOrgSlug, testUser.id, {
      role: "owner",
      createdAt: new Date("2020-01-01T00:00:00Z"),
    });

    const { userIds } = await makeFakeMembers(pagedOrgSlug, 12, {
      startAt: new Date("2021-01-01T00:00:00Z"),
    });
    otherMemberIds = userIds;

    // Authenticated and a member of some other organization, but not of
    // pagedOrgSlug. (A user with no membership at all would make the session
    // hook create an organization, and with it a Polar customer.)
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

  const getPage = (pageIndex?: number | string) =>
    request(server.server)
      .get(`/api/organizations/${pagedOrgSlug}/members`)
      .query(pageIndex === undefined ? {} : { pageIndex })
      .set(authHeaders);

  test("should return the first page of 12 members, oldest first, with meta", async () => {
    const response = await getPage(0);

    expect(response.status).toEqual(200);
    expect(response.body.members).toHaveLength(12);
    expect(response.body.meta).toEqual({ totalCount: 13, totalPages: 2 });
    expect(response.body.members[0].user.id).toBe(testUser.id);

    const createdAt = response.body.members.map(
      (member: { createdAt: string }) => member.createdAt,
    );
    expect(createdAt).toEqual([...createdAt].sort());
  });

  test("should return the remaining member on the second page without repeating any", async () => {
    const firstPage = await getPage(0);
    const secondPage = await getPage(1);

    expect(secondPage.status).toEqual(200);
    expect(secondPage.body.members).toHaveLength(1);
    expect(secondPage.body.members[0].user.id).toBe(otherMemberIds[11]);
    expect(secondPage.body.meta).toEqual({ totalCount: 13, totalPages: 2 });

    const ids = [...firstPage.body.members, ...secondPage.body.members].map(
      (member: { id: string }) => member.id,
    );
    expect(new Set(ids).size).toBe(13);
  });

  test("should return an empty page, with the same meta, past the last page", async () => {
    const response = await getPage(5);

    expect(response.status).toEqual(200);
    expect(response.body.members).toEqual([]);
    expect(response.body.meta).toEqual({ totalCount: 13, totalPages: 2 });
  });

  test("should return every member as a single page when pageIndex is omitted", async () => {
    const response = await getPage();

    expect(response.status).toEqual(200);
    expect(response.body.members).toHaveLength(13);
    expect(response.body.meta).toEqual({ totalCount: 13, totalPages: 1 });
  });

  test("should return 400 when pageIndex is negative or not a number", async () => {
    expect((await getPage(-1)).status).toEqual(400);
    expect((await getPage("abc")).status).toEqual(400);
  });

  test("should return 403 when the user is not a member of the organization", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${pagedOrgSlug}/members`)
      .query({ pageIndex: 0 })
      .set(strangerHeaders);

    expect(response.status).toEqual(403);
    expect(response.body).not.toHaveProperty("members");
  });

  test("should return 401 when there is no session", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${pagedOrgSlug}/members`)
      .query({ pageIndex: 0 });

    expect(response.status).toEqual(401);
  });

  test("should never list members of another organization", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/members`)
      .query({ pageIndex: 0 })
      .set(authHeaders);

    expect(response.status).toEqual(200);
    const ids = response.body.members.map(
      (member: { user: { id: string } }) => member.user.id,
    );
    expect(ids.some((id: string) => otherMemberIds.includes(id))).toBe(false);
  });
});
