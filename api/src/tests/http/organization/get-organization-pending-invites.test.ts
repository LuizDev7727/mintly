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
import { makeFakeInvitation } from "@/tests/factories/make-fake-invitation.ts";
import { makeFakeInvitations } from "@/tests/factories/make-fake-invitations.ts";
import { makeFakeUser } from "@/tests/factories/make-fake-user.ts";

describe("GET [/api/organizations/:slug/invites/pending]", () => {
  // 13 pending invites = one full page of 12 plus one, sent oldest to newest;
  // the newest (invitationIds[12]) must come back first.
  let pagedOrgSlug: string;
  let invitationIds: string[];
  let strangerId: string;
  let strangerHeaders: Record<string, string>;

  beforeAll(async () => {
    const { organizationSlug } = await makeFakeOrganization(testUser.id);
    pagedOrgSlug = organizationSlug;
    await makeFakeMember(pagedOrgSlug, testUser.id, { role: "owner" });

    ({ invitationIds } = await makeFakeInvitations(
      pagedOrgSlug,
      testUser.id,
      13,
      { startAt: new Date("2021-01-01T00:00:00Z") },
    ));

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
    await db.delete(usersTable).where(inArray(usersTable.id, [strangerId]));
  });

  const getPage = (pageIndex?: number | string) =>
    request(server.server)
      .get(`/api/organizations/${pagedOrgSlug}/invites/pending`)
      .query(pageIndex === undefined ? {} : { pageIndex })
      .set(authHeaders);

  test("should return the first page of 12 invites, newest first, with meta", async () => {
    const response = await getPage(0);

    expect(response.status).toEqual(200);
    expect(response.body.pendingInvites).toHaveLength(12);
    expect(response.body.meta).toEqual({ totalCount: 13, totalPages: 2 });
    expect(response.body.pendingInvites[0].id).toBe(invitationIds[12]);

    const createdAt = response.body.pendingInvites.map(
      (invite: { createdAt: string }) => invite.createdAt,
    );
    expect(createdAt).toEqual([...createdAt].sort().reverse());
  });

  test("should return the remaining invite on the second page without repeating any", async () => {
    const firstPage = await getPage(0);
    const secondPage = await getPage(1);

    expect(secondPage.status).toEqual(200);
    expect(secondPage.body.pendingInvites).toHaveLength(1);
    expect(secondPage.body.pendingInvites[0].id).toBe(invitationIds[0]);
    expect(secondPage.body.meta).toEqual({ totalCount: 13, totalPages: 2 });

    const ids = [
      ...firstPage.body.pendingInvites,
      ...secondPage.body.pendingInvites,
    ].map((invite: { id: string }) => invite.id);
    expect(new Set(ids).size).toBe(13);
  });

  test("should return an empty page, with the same meta, past the last page", async () => {
    const response = await getPage(5);

    expect(response.status).toEqual(200);
    expect(response.body.pendingInvites).toEqual([]);
    expect(response.body.meta).toEqual({ totalCount: 13, totalPages: 2 });
  });

  test("should default to the first page when pageIndex is omitted", async () => {
    const response = await getPage();

    expect(response.status).toEqual(200);
    expect(response.body.pendingInvites).toHaveLength(12);
  });

  test("should return 400 when pageIndex is negative or not a number", async () => {
    expect((await getPage(-1)).status).toEqual(400);
    expect((await getPage("abc")).status).toEqual(400);
  });

  test("should not list invites that were already accepted or declined", async () => {
    const { invitationId: acceptedId } = await makeFakeInvitation(
      pagedOrgSlug,
      testUser.id,
      { status: "accepted" },
    );

    const response = await getPage(0);

    const ids = response.body.pendingInvites.map(
      (invite: { id: string }) => invite.id,
    );
    expect(ids).not.toContain(acceptedId);
  });

  test("should return 403 when the user is not a member of the organization", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${pagedOrgSlug}/invites/pending`)
      .set(strangerHeaders);

    expect(response.status).toEqual(403);
    expect(response.body).not.toHaveProperty("pendingInvites");
  });

  test("should return 401 when there is no session", async () => {
    const response = await request(server.server).get(
      `/api/organizations/${pagedOrgSlug}/invites/pending`,
    );

    expect(response.status).toEqual(401);
  });

  test("should never list invites of another organization", async () => {
    const { organizationSlug: yetAnotherOrgSlug } =
      await makeFakeOrganization(testUser.id);
    await makeFakeMember(yetAnotherOrgSlug, testUser.id, { role: "owner" });

    const response = await request(server.server)
      .get(`/api/organizations/${yetAnotherOrgSlug}/invites/pending`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body.pendingInvites).toEqual([]);
  });
});
