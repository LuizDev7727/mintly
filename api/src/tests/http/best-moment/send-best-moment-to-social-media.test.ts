import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import { tasks } from "@trigger.dev/sdk";
import { server } from "@/app.ts";
import { db } from "@/infra/db/client.ts";
import { bestMomentsTable } from "@/infra/db/tables/best-moments.table.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { socialsToPostTable } from "@/infra/db/tables/socials-to-post.table.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";
import { makeFakeProject } from "@/tests/factories/make-fake-project.ts";

let channelId: string;
let bestMomentId: string;

async function makeIntegration(provider: "YOUTUBE" | "TIKTOK") {
  const [{ id }] = await db
    .insert(integrationsTable)
    .values({
      name: "Channel",
      email: "channel@example.com",
      accessToken: "access-token",
      refresh_token: "refresh-token",
      expiry_in: 3600,
      provider,
      channelId,
    })
    .returning({ id: integrationsTable.id });

  return id;
}

async function postsOfChannel() {
  return db.select().from(postsTable).where(eq(postsTable.channelId, channelId));
}

beforeAll(async () => {
  ({ channelId } = await makeFakeChannel(testOrgSlug));
  const { projectId } = await makeFakeProject(channelId, testUser.id);

  [{ id: bestMomentId }] = await db
    .insert(bestMomentsTable)
    .values({ title: "my clip", storageKey: "my-clip-key", projectId })
    .returning({ id: bestMomentsTable.id });
});

beforeEach(() => {
  vi.mocked(tasks.trigger).mockClear();
});

const send = (integrationId: string) =>
  request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/best-moments/${bestMomentId}/send`)
    .set(authHeaders)
    .send({ integrationId });

describe("send best moment to social media (POST /best-moments/:bestMomentId/send)", () => {
  test("should create the post and trigger publish-best-moment for a YouTube integration", async () => {
    const integrationId = await makeIntegration("YOUTUBE");

    const response = await send(integrationId);

    expect(response.status).toEqual(204);

    const [post] = await postsOfChannel();
    expect(post).toMatchObject({ title: "my clip", status: "PROCESSING" });

    const socials = await db
      .select()
      .from(socialsToPostTable)
      .where(eq(socialsToPostTable.postId, post.id));
    expect(socials.map((social) => social.social)).toEqual(["YOUTUBE"]);

    expect(tasks.trigger).toHaveBeenCalledTimes(1);
    expect(tasks.trigger).toHaveBeenCalledWith("publish-best-moment", {
      videoUrl: expect.any(String),
      title: "my clip",
      postId: post.id,
      integrationId,
      channelId,
    });
  });

  test("should return 422 and create no post for a TikTok integration", async () => {
    const before = (await postsOfChannel()).length;
    const integrationId = await makeIntegration("TIKTOK");

    const response = await send(integrationId);

    expect(response.status).toEqual(422);
    expect(await postsOfChannel()).toHaveLength(before);
    expect(tasks.trigger).not.toHaveBeenCalled();
  });
});
