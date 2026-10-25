import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import { server } from "@/app.ts";
import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";
import { makeFakeOrganization } from "@/tests/factories/make-fake-organization.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";

let channelOfAnotherOrg: string;

beforeAll(async () => {
  const { organizationSlug: anotherOrgSlug } = await makeFakeOrganization(testUser.id);
  ({ channelId: channelOfAnotherOrg } = await makeFakeChannel(anotherOrgSlug));
});

describe("POST [/api/organizations/:slug/channels/:channelId/posts]", () => {
  test("should return 404 and create no post when the channel belongs to another organization", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelOfAnotherOrg}/posts`)
      .set(authHeaders)
      .send({
        posts: [
          {
            file: {
              name: "video.mp4",
              key: "any-key",
              type: "video/mp4",
              size: 1024,
              duration: 10,
            },
            shouldGenerateThumbnail: false,
            shouldGenerateShorts: false,
            scheduledTo: null,
            socialsToPost: [
              { id: "social-id", name: "Channel", provider: "YOUTUBE", avatarUrl: null },
            ],
          },
        ],
      });

    expect(response.status).toEqual(404);

    const posts = await db
      .select({ id: postsTable.id })
      .from(postsTable)
      .where(eq(postsTable.channelId, channelOfAnotherOrg));

    expect(posts).toHaveLength(0);
  });
});
