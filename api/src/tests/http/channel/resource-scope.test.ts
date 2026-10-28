import { describe, test, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import { runs, tasks } from "@trigger.dev/sdk";
import { server } from "@/app.ts";
import { db } from "@/infra/db/client.ts";
import { bestMomentsTable } from "@/infra/db/tables/best-moments.table.ts";
import { foldersTable } from "@/infra/db/tables/folders.table.ts";
import { inspirationalThumbnailsTable } from "@/infra/db/tables/inspirational-thumbnail.table.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { socialsToPostTable } from "@/infra/db/tables/socials-to-post.table.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";
import { makeFakeOrganization } from "@/tests/factories/make-fake-organization.ts";
import { makeFakeProject } from "@/tests/factories/make-fake-project.ts";

// Os recursos "alheios" pertencem a um canal de OUTRA organização. A URL usa o
// canal próprio (que passa no hook de canal), e o id do recurso é o alheio: a
// rota precisa responder 404 e não tocar no recurso.

let ownChannelId: string;
let foreignChannelId: string;

let foreignPostId: string;
let foreignFolderId: string;
let foreignIntegrationId: string;
let foreignThumbnailId: string;
let foreignProjectId: string;
let foreignBestMomentId: string;

async function makeIntegration(channelId: string) {
  const [{ id }] = await db
    .insert(integrationsTable)
    .values({
      name: "Channel",
      email: "channel@example.com",
      accessToken: "access-token",
      refresh_token: "refresh-token",
      expiry_in: 3600,
      provider: "YOUTUBE",
      channelId,
    })
    .returning({ id: integrationsTable.id });

  return id;
}

async function makePost(channelId: string, runId: string | null = null) {
  const [{ id }] = await db
    .insert(postsTable)
    .values({
      channelId,
      title: "post",
      mimeType: "video/mp4",
      description: "",
      size: 1024,
      duration: 10,
      ownerId: testUser.id,
      runId,
    })
    .returning({ id: postsTable.id });

  await db.insert(socialsToPostTable).values({
    postId: id,
    social: "YOUTUBE",
    socialName: "Channel",
  });

  return id;
}

async function makeFolder(channelId: string) {
  const [{ id }] = await db
    .insert(foldersTable)
    .values({ title: "folder", channelId })
    .returning({ id: foldersTable.id });

  return id;
}

beforeAll(async () => {
  ({ channelId: ownChannelId } = await makeFakeChannel(testOrgSlug));

  const { organizationSlug: foreignOrgSlug } = await makeFakeOrganization(testUser.id);
  ({ channelId: foreignChannelId } = await makeFakeChannel(foreignOrgSlug));

  foreignPostId = await makePost(foreignChannelId, "run_foreign_post");
  foreignFolderId = await makeFolder(foreignChannelId);
  foreignIntegrationId = await makeIntegration(foreignChannelId);

  [{ id: foreignThumbnailId }] = await db
    .insert(inspirationalThumbnailsTable)
    .values({
      name: "thumb",
      key: "foreign-thumbnail-key",
      type: "image/png",
      sizeInBytes: 10,
      channelId: foreignChannelId,
    })
    .returning({ id: inspirationalThumbnailsTable.id });

  ({ projectId: foreignProjectId } = await makeFakeProject(foreignChannelId, testUser.id));

  [{ id: foreignBestMomentId }] = await db
    .insert(bestMomentsTable)
    .values({
      title: "clip",
      storageKey: "foreign-clip-key",
      projectId: foreignProjectId,
    })
    .returning({ id: bestMomentsTable.id });
});

beforeEach(() => {
  vi.mocked(runs.cancel).mockClear();
  vi.mocked(tasks.trigger).mockClear();
});

// Calculada a cada uso: `testOrgSlug` só existe depois do beforeAll do setup.
const base = () => `/api/organizations/${testOrgSlug}/channels`;

describe("recursos de outro canal respondem 404", () => {
  test("DELETE [/integrations/:integrationId] should not delete an integration of another organization", async () => {
    const response = await request(server.server)
      .delete(`${base()}/${ownChannelId}/integrations/${foreignIntegrationId}`)
      .set(authHeaders);

    expect(response.status).toEqual(404);

    const rows = await db
      .select({ id: integrationsTable.id })
      .from(integrationsTable)
      .where(eq(integrationsTable.id, foreignIntegrationId));
    expect(rows).toHaveLength(1);
  });

  test("PUT [/posts/:postId/cancel] should not cancel a post of another organization", async () => {
    const response = await request(server.server)
      .put(`${base()}/${ownChannelId}/posts/${foreignPostId}/cancel`)
      .set(authHeaders)
      .send({});

    expect(response.status).toEqual(404);
    expect(runs.cancel).not.toHaveBeenCalled();

    const [post] = await db
      .select({ status: postsTable.status })
      .from(postsTable)
      .where(eq(postsTable.id, foreignPostId));
    expect(post.status).not.toEqual("CANCELED");
  });

  test("DELETE [/folders/:folderId] should not delete a folder of another organization", async () => {
    const response = await request(server.server)
      .delete(`${base()}/${ownChannelId}/folders/${foreignFolderId}`)
      .set(authHeaders);

    expect(response.status).toEqual(404);

    const rows = await db
      .select({ id: foldersTable.id })
      .from(foldersTable)
      .where(eq(foldersTable.id, foreignFolderId));
    expect(rows).toHaveLength(1);
  });

  test("PUT [/posts/move-to-folder] should not link a post of the channel to a folder of another organization", async () => {
    // Canal próprio só deste teste: outros testes do arquivo contam os posts de
    // `ownChannelId`.
    const { channelId } = await makeFakeChannel(testOrgSlug);
    const postId = await makePost(channelId);

    const response = await request(server.server)
      .put(`${base()}/${channelId}/posts/move-to-folder`)
      .set(authHeaders)
      .send({ postIds: [postId], folderId: foreignFolderId });

    expect(response.status).toEqual(404);

    const [post] = await db
      .select({ folderId: postsTable.folderId })
      .from(postsTable)
      .where(eq(postsTable.id, postId));
    expect(post.folderId).toBeNull();
  });

  test("PUT [/folders/:folderId] should not rename a folder of another organization", async () => {
    const response = await request(server.server)
      .put(`${base()}/${ownChannelId}/folders/${foreignFolderId}`)
      .set(authHeaders)
      .send({ title: "hijacked" });

    expect(response.status).toEqual(404);

    const [folder] = await db
      .select({ title: foldersTable.title })
      .from(foldersTable)
      .where(eq(foldersTable.id, foreignFolderId));
    expect(folder.title).toEqual("folder");
  });

  test("DELETE [/inspirational-thumbnails/:id] should not delete a thumbnail of another organization", async () => {
    const response = await request(server.server)
      .delete(`${base()}/${ownChannelId}/inspirational-thumbnails/${foreignThumbnailId}`)
      .set(authHeaders);

    expect(response.status).toEqual(404);

    const rows = await db
      .select({ id: inspirationalThumbnailsTable.id })
      .from(inspirationalThumbnailsTable)
      .where(eq(inspirationalThumbnailsTable.id, foreignThumbnailId));
    expect(rows).toHaveLength(1);
  });

  test("GET [/posts/:postId] should not return a post of another organization", async () => {
    const response = await request(server.server)
      .get(`${base()}/${ownChannelId}/posts/${foreignPostId}`)
      .set(authHeaders);

    expect(response.status).toEqual(404);
  });

  test("GET [/projects/:projectId] should not return a project of another organization", async () => {
    const response = await request(server.server)
      .get(`${base()}/${ownChannelId}/projects/${foreignProjectId}`)
      .set(authHeaders);

    expect(response.status).toEqual(404);
  });

  test("GET [/projects/:projectId/best-moments] should not return the clips of a project of another organization", async () => {
    const response = await request(server.server)
      .get(`${base()}/${ownChannelId}/projects/${foreignProjectId}/best-moments`)
      .set(authHeaders);

    expect(response.status).toEqual(404);
    expect(JSON.stringify(response.body)).not.toContain("foreign-clip-key");
  });

  test("POST [/best-moments/:id/send] should not publish a clip of another organization", async () => {
    const ownIntegrationId = await makeIntegration(ownChannelId);

    const response = await request(server.server)
      .post(`${base()}/${ownChannelId}/best-moments/${foreignBestMomentId}/send`)
      .set(authHeaders)
      .send({ integrationId: ownIntegrationId });

    expect(response.status).toEqual(404);
    expect(tasks.trigger).not.toHaveBeenCalled();

    const posts = await db
      .select({ id: postsTable.id })
      .from(postsTable)
      .where(eq(postsTable.channelId, ownChannelId));
    expect(posts).toHaveLength(0);
  });
});

describe("recursos do próprio canal continuam funcionando", () => {
  test("GET [/projects/:projectId/best-moments] should return the clips of a project of the channel", async () => {
    const { projectId } = await makeFakeProject(ownChannelId, testUser.id);

    const [{ id: bestMomentId }] = await db
      .insert(bestMomentsTable)
      .values({ title: "own clip", storageKey: "own-clip-key", projectId })
      .returning({ id: bestMomentsTable.id });

    const response = await request(server.server)
      .get(`${base()}/${ownChannelId}/projects/${projectId}/best-moments`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body.bestMoments).toHaveLength(1);
    expect(response.body.bestMoments[0]).toMatchObject({ id: bestMomentId, title: "own clip" });
    expect(response.body.nextCursor).toBeNull();
  });

  test("PUT [/posts/:postId/cancel] should cancel the run stored in the post and ignore a runId sent by the client", async () => {
    const postId = await makePost(ownChannelId, "run_own_post");

    const response = await request(server.server)
      .put(`${base()}/${ownChannelId}/posts/${postId}/cancel`)
      .set(authHeaders)
      .send({ runId: "run_of_someone_else" });

    expect(response.status).toEqual(204);
    expect(runs.cancel).toHaveBeenCalledTimes(1);
    expect(runs.cancel).toHaveBeenCalledWith("run_own_post");

    const [post] = await db
      .select({ status: postsTable.status })
      .from(postsTable)
      .where(eq(postsTable.id, postId));
    expect(post.status).toEqual("CANCELED");
  });

  test("GET [/posts/:postId] should return a post of the channel", async () => {
    const postId = await makePost(ownChannelId);

    const response = await request(server.server)
      .get(`${base()}/${ownChannelId}/posts/${postId}`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
  });

  test("GET [/projects/:projectId] should return a project of the channel", async () => {
    const { projectId } = await makeFakeProject(ownChannelId, testUser.id);

    const response = await request(server.server)
      .get(`${base()}/${ownChannelId}/projects/${projectId}`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
  });

  test("PUT [/posts/move-to-folder] should move a post to a folder of the channel and back out of it", async () => {
    const { channelId } = await makeFakeChannel(testOrgSlug);
    const postId = await makePost(channelId);
    const folderId = await makeFolder(channelId);

    const move = await request(server.server)
      .put(`${base()}/${channelId}/posts/move-to-folder`)
      .set(authHeaders)
      .send({ postIds: [postId], folderId });
    expect(move.status).toEqual(204);

    const [moved] = await db
      .select({ folderId: postsTable.folderId })
      .from(postsTable)
      .where(eq(postsTable.id, postId));
    expect(moved.folderId).toEqual(folderId);

    const remove = await request(server.server)
      .put(`${base()}/${channelId}/posts/move-to-folder`)
      .set(authHeaders)
      .send({ postIds: [postId], folderId: null });
    expect(remove.status).toEqual(204);

    const [removed] = await db
      .select({ folderId: postsTable.folderId })
      .from(postsTable)
      .where(eq(postsTable.id, postId));
    expect(removed.folderId).toBeNull();
  });

  test("PUT and DELETE [/folders/:folderId] should rename and delete a folder of the channel", async () => {
    const folderId = await makeFolder(ownChannelId);

    const rename = await request(server.server)
      .put(`${base()}/${ownChannelId}/folders/${folderId}`)
      .set(authHeaders)
      .send({ title: "renamed" });
    expect(rename.status).toEqual(204);

    const remove = await request(server.server)
      .delete(`${base()}/${ownChannelId}/folders/${folderId}`)
      .set(authHeaders);
    expect(remove.status).toEqual(204);
  });

  test("DELETE [/integrations/:integrationId] should delete an integration of the channel", async () => {
    const integrationId = await makeIntegration(ownChannelId);

    const response = await request(server.server)
      .delete(`${base()}/${ownChannelId}/integrations/${integrationId}`)
      .set(authHeaders);

    expect(response.status).toEqual(204);
  });
});
