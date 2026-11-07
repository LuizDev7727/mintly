import { describe, test, expect } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { authHeaders, testUser } from "@/tests/setup.ts";
import { makeFakeOrganization } from "@/tests/factories/make-fake-organization.ts";
import { makeFakeMember } from "@/tests/factories/make-fake-member.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";

const GIGABYTE = 1024 * 1024 * 1024;

describe("GET [/api/organizations/:slug/overview]", () => {
  // A soma dos tamanhos (bytes) passava de 2 GB e a query estourava com
  // "integer out of range", deixando a página presa no loading.
  test("should return 200 with the storage total when the posts add up to more than 2 GB", async () => {
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
      })),
    );

    const response = await request(server.server)
      .get(`/api/organizations/${organizationSlug}/overview`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body.overview.storage.totalStorage).toEqual(2 * GIGABYTE);
    expect(response.body.overview.storage.series).toHaveLength(30);
  });

  test("should return 401 when not authenticated", async () => {
    const response = await request(server.server).get(
      "/api/organizations/any-org/overview",
    );

    expect(response.status).toEqual(401);
  });
});
