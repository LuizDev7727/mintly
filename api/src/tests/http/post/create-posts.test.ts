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

let channelOfAnotherOrg: string;

beforeAll(async () => {
  const { organizationSlug: anotherOrgSlug } = await makeFakeOrganization(testUser.id);
  ({ channelId: channelOfAnotherOrg } = await makeFakeChannel(anotherOrgSlug));
});

function makePost(name: string, scheduledTo: string | null = null) {
  // Chaves de upload têm o prefixo do usuário que enviou o arquivo.
  const key = `${testUser.id}/${name}`;

  return {
    file: {
      name: `${name}.mp4`,
      key,
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
  };
}

async function postsOf(channelId: string) {
  return db
    .select({ id: postsTable.id, status: postsTable.status })
    .from(postsTable)
    .where(eq(postsTable.channelId, channelId));
}

function createPosts(channelId: string, posts: ReturnType<typeof makePost>[]) {
  return request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/posts`)
    .set(authHeaders)
    .send({ posts });
}

describe("POST [/api/organizations/:slug/channels/:channelId/posts]", () => {
  test("should return 404 and create no post when the channel belongs to another organization", async () => {
    const response = await createPosts(channelOfAnotherOrg, [makePost("file-key")]);

    expect(response.status).toEqual(404);
    expect(await postsOf(channelOfAnotherOrg)).toHaveLength(0);
  });

  test("should return 201 for a post scheduled 30 days ahead and trigger the task with the file key", async () => {
    const { channelId } = await makeFakeChannel(testOrgSlug);
    vi.mocked(tasks.trigger).mockClear();
    const scheduledTo = new Date(Date.now() + 30 * DAY_IN_MS).toISOString();

    const response = await createPosts(channelId, [makePost("file-key", scheduledTo)]);

    expect(response.status).toEqual(201);

    const [post] = await postsOf(channelId);
    expect(post.status).toEqual("SCHEDULED");

    // O link assinado nasce dentro da task, depois da espera: o payload leva
    // só a chave do arquivo, nunca uma URL que poderia expirar antes da data.
    const [taskId, payload] = vi.mocked(tasks.trigger).mock.calls[0];
    expect(taskId).toEqual("process-post");
    expect(payload).toMatchObject({
      channelId,
      post: { fileKey: `${testUser.id}/file-key`, scheduledTo },
    });
    expect((payload as { post: object }).post).not.toHaveProperty("fileUrl");
  });

  test.each([
    ["is not a valid date", "not-a-date"],
    ["is in the past", new Date(Date.now() - DAY_IN_MS).toISOString()],
  ])("should return 400 and create no post when scheduledTo %s", async (_, scheduledTo) => {
    const { channelId } = await makeFakeChannel(testOrgSlug);

    const response = await createPosts(channelId, [makePost("file-key", scheduledTo)]);

    expect(response.status).toEqual(400);
    expect(await postsOf(channelId)).toHaveLength(0);
  });
});
