import request from "supertest";
import { describe, expect, test } from "vitest";
import { server } from "@/app.ts";
import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";
import { makeFakeMember } from "@/tests/factories/make-fake-member.ts";
import { makeFakeOrganization } from "@/tests/factories/make-fake-organization.ts";
import { authHeaders, testUser } from "@/tests/setup.ts";

const GIGABYTE = 1024 * 1024 * 1024;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

describe("GET [/api/organizations/:slug/usage]", () => {
  // A soma dos tamanhos (bytes) passava de 2 GB e a query estourava com
  // "integer out of range".
  test("should return 200 with the storage when the posts add up to more than 2 GB", async () => {
    const { organizationSlug } = await makeFakeOrganization(testUser.id);
    await makeFakeMember(organizationSlug, testUser.id);
    const { channelId } = await makeFakeChannel(organizationSlug);

    await db.insert(postsTable).values(
      ["a", "b"].map((name) => ({
        channelId,
        ownerId: testUser.id,
        title: name,
        description: "",
        mimeType: "video/mp4",
        size: GIGABYTE,
        duration: 10,
        // Antes do início do mês: entra nas somas de mês atual e anterior.
        createdAt: new Date(Date.now() - 60 * DAY_IN_MS),
      })),
    );

    const now = Date.now();
    const response = await request(server.server)
      .get(`/api/organizations/${organizationSlug}/usage`)
      .query({
        startDate: new Date(now - 7 * DAY_IN_MS).toISOString(),
        endDate: new Date(now + DAY_IN_MS).toISOString(),
      })
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body.storage.currentBytes).toEqual(2 * GIGABYTE);
    expect(response.body.storage.previousBytes).toEqual(2 * GIGABYTE);
  });

  test("should return 401 when not authenticated", async () => {
    const response = await request(server.server).get("/api/organizations/any-org/usage").query({
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    });

    expect(response.status).toEqual(401);
  });
});
