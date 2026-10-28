import { describe, test, expect, beforeAll, vi } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import { tasks } from "@trigger.dev/sdk";
import { server } from "@/app.ts";
import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { checkFileExists } from "@/utils/cloudflare/check-file-exists.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";
import { makeFakeOrganization } from "@/tests/factories/make-fake-organization.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";
import { makeFakeMember } from "@/tests/factories/make-fake-member.ts";
import { webhooksTable } from "@/infra/db/tables/webhooks.table.ts";
import { qstash } from "@/lib/qstash.ts";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

let channelOfAnotherOrg: string;

beforeAll(async () => {
  const { organizationSlug: anotherOrgSlug } = await makeFakeOrganization(testUser.id);
  ({ channelId: channelOfAnotherOrg } = await makeFakeChannel(anotherOrgSlug));
});

type Provider = "YOUTUBE" | "TIKTOK" | "INSTAGRAM";

function makePost(
  name: string,
  scheduledTo: string | null = null,
  options: { type?: string; providers?: Provider[] } = {},
) {
  const { type = "video/mp4", providers = ["YOUTUBE"] } = options;

  // Chaves de upload têm o prefixo do usuário que enviou o arquivo.
  const key = `${testUser.id}/${name}`;

  return {
    file: {
      name: `${name}.mp4`,
      key,
      type,
      size: 1024,
      duration: 10,
    },
    shouldGenerateThumbnail: false,
    shouldGenerateShorts: false,
    scheduledTo,
    socialsToPost: providers.map((provider) => ({
      id: `social-${provider}`,
      name: "Channel",
      provider,
      avatarUrl: null,
    })),
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

  test("should create a post for a JPEG image published on Instagram and trigger the task with its type", async () => {
    const { channelId } = await makeFakeChannel(testOrgSlug);
    vi.mocked(tasks.trigger).mockClear();

    const response = await createPosts(channelId, [
      makePost("sunset", null, { type: "image/jpeg", providers: ["INSTAGRAM"] }),
    ]);

    expect(response.status).toEqual(201);
    expect(await postsOf(channelId)).toHaveLength(1);

    const [, payload] = vi.mocked(tasks.trigger).mock.calls[0];
    expect((payload as { post: object }).post).toMatchObject({
      mimeType: "image/jpeg",
      title: "sunset.mp4",
    });
  });

  test.each([
    ["YOUTUBE", ["YOUTUBE"]],
    ["TIKTOK", ["TIKTOK"]],
    ["YOUTUBE and INSTAGRAM", ["YOUTUBE", "INSTAGRAM"]],
  ] as [string, Provider[]][])(
    "should return 400 and create no post for an image published on %s",
    async (_, providers) => {
      const { channelId } = await makeFakeChannel(testOrgSlug);

      const response = await createPosts(channelId, [
        makePost("photo", null, { type: "image/png", providers }),
      ]);

      expect(response.status).toEqual(400);
      expect(await postsOf(channelId)).toHaveLength(0);
    },
  );

  test.each(["image/gif", "application/pdf", "video/quicktime"])(
    "should return 400 and create no post for the unsupported type %s",
    async (type) => {
      const { channelId } = await makeFakeChannel(testOrgSlug);

      const response = await createPosts(channelId, [
        makePost("file", null, { type, providers: ["INSTAGRAM"] }),
      ]);

      expect(response.status).toEqual(400);
      expect(await postsOf(channelId)).toHaveLength(0);
    },
  );

  test("should still accept an MP4 video on YouTube", async () => {
    const { channelId } = await makeFakeChannel(testOrgSlug);

    const response = await createPosts(channelId, [makePost("clip")]);

    expect(response.status).toEqual(201);
  });

  test("should return 404 and create no post when one of the files does not exist", async () => {
    const { channelId } = await makeFakeChannel(testOrgSlug);
    vi.mocked(checkFileExists)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new ResourceNotFoundError("File not found"));

    const response = await createPosts(channelId, [makePost("file-a"), makePost("missing-file")]);

    expect(response.status).toEqual(404);
    expect(await postsOf(channelId)).toHaveLength(0);
  });

  test("should mark the post as ERROR when its run cannot be triggered", async () => {
    const { channelId } = await makeFakeChannel(testOrgSlug);
    vi.mocked(tasks.trigger).mockRejectedValueOnce(new Error("trigger is down"));

    const response = await createPosts(channelId, [makePost("file-a")]);

    expect(response.status).toEqual(500);

    const posts = await postsOf(channelId);
    expect(posts).toHaveLength(1);
    expect(posts[0].status).toEqual("ERROR");
  });

  test("should keep the posts already triggered, mark the failed one as ERROR and create none after it", async () => {
    const { channelId } = await makeFakeChannel(testOrgSlug);
    vi.mocked(tasks.trigger)
      .mockResolvedValueOnce({ id: "run_ok" } as never)
      .mockRejectedValueOnce(new Error("trigger is down"));

    const response = await createPosts(channelId, [
      makePost("file-a"),
      makePost("file-b"),
      makePost("file-c"),
    ]);

    expect(response.status).toEqual(500);

    const statuses = (await postsOf(channelId)).map(({ status }) => status).sort();
    expect(statuses).toEqual(["ERROR", "PROCESSING"]);
  });
});

// Fica numa organização só dele: um webhook de `post.created` na organização
// dos outros testes faria todos eles publicarem no QStash.
describe("post.created webhook of POST [/api/organizations/:slug/channels/:channelId/posts]", () => {
  test("should publish a different body for each request, with an eventId", async () => {
    const { organizationSlug } = await makeFakeOrganization(testUser.id);
    await makeFakeMember(organizationSlug, testUser.id);
    const { channelId } = await makeFakeChannel(organizationSlug);

    await db.insert(webhooksTable).values({
      url: "https://example.com/post-created",
      signingKey: "key",
      triggers: ["post.created"],
      organizationSlug,
    });

    const publishJSON = vi
      .spyOn(qstash, "publishJSON")
      .mockResolvedValue({ messageId: "msg" } as never);

    // O QStash descarta mensagens de corpo idêntico: duas criações seguidas não
    // podem gerar o mesmo evento.
    for (const name of ["first", "second"]) {
      const response = await request(server.server)
        .post(`/api/organizations/${organizationSlug}/channels/${channelId}/posts`)
        .set(authHeaders)
        .send({ posts: [makePost(name)] });

      expect(response.status).toEqual(201);
    }

    expect(publishJSON).toHaveBeenCalledTimes(2);

    const bodies = publishJSON.mock.calls.map(([request]) => request.body as { trigger: string; payload: { eventId?: string } });
    expect(bodies[0].trigger).toEqual("post.created");
    expect(bodies[0].payload.eventId).toEqual(expect.any(String));
    expect(JSON.stringify(bodies[0])).not.toEqual(JSON.stringify(bodies[1]));

    publishJSON.mockRestore();
  });
});
