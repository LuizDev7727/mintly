import { describe, test, expect, beforeAll, vi } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import { tasks } from "@trigger.dev/sdk";
import { server } from "@/app.ts";
import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";
import { makeFakeOrganization } from "@/tests/factories/make-fake-organization.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

let ownChannelId: string;
let channelOfAnotherOrg: string;

beforeAll(async () => {
  ({ channelId: ownChannelId } = await makeFakeChannel(testOrgSlug));

  const { organizationSlug: anotherOrgSlug } = await makeFakeOrganization(testUser.id);
  ({ channelId: channelOfAnotherOrg } = await makeFakeChannel(anotherOrgSlug));
});

function makeBody(scheduledTo: string | null) {
  return {
    posts: [
      {
        file: {
          name: "video.mp4",
          key: "file-key",
          type: "video/mp4",
          size: 1024,
          duration: 10,
        },
        shouldGenerateThumbnail: false,
        shouldGenerateShorts: false,
        scheduledTo,
        socialsToPost: [
          { id: "social-id", name: "Channel", provider: "YOUTUBE", avatarUrl: null },
        ],
      },
    ],
  };
}

describe("POST [/api/organizations/:slug/channels/:channelId/posts]", () => {
  test("should return 404 and create no post when the channel belongs to another organization", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelOfAnotherOrg}/posts`)
      .set(authHeaders)
      .send(makeBody(null));

    expect(response.status).toEqual(404);

    const posts = await db
      .select({ id: postsTable.id })
      .from(postsTable)
      .where(eq(postsTable.channelId, channelOfAnotherOrg));

    expect(posts).toHaveLength(0);
  });

  test("should return 201 for a post scheduled 30 days ahead and trigger the task with the file key", async () => {
    const scheduledTo = new Date(Date.now() + 30 * DAY_IN_MS).toISOString();

    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${ownChannelId}/posts`)
      .set(authHeaders)
      .send(makeBody(scheduledTo));

    expect(response.status).toEqual(201);

    const [post] = await db
      .select({ status: postsTable.status })
      .from(postsTable)
      .where(eq(postsTable.channelId, ownChannelId));

    expect(post.status).toEqual("SCHEDULED");

    // O link assinado nasce dentro da task, depois da espera: o payload leva
    // só a chave do arquivo, nunca uma URL que poderia expirar antes da data.
    expect(tasks.trigger).toHaveBeenCalledWith(
      "process-post",
      expect.objectContaining({
        channelId: ownChannelId,
        post: expect.objectContaining({ fileKey: "file-key", scheduledTo }),
      }),
    );

    const [, payload] = vi.mocked(tasks.trigger).mock.calls.at(-1)!;
    expect((payload as { post: object }).post).not.toHaveProperty("fileUrl");
  });
});
