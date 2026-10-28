import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import { server } from "@/app.ts";
import { db } from "@/infra/db/client.ts";
import { inspirationalThumbnailsTable } from "@/infra/db/tables/inspirational-thumbnail.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { projectsTable } from "@/infra/db/tables/projects.table.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";

// As chaves de upload são `<userId>/<uuid>`. Uma chave de outro usuário, ou sem
// prefixo (legada ou inventada), nunca pode ser usada: responde 404 como um
// arquivo inexistente.

let channelId: string;

beforeAll(async () => {
  ({ channelId } = await makeFakeChannel(testOrgSlug));
});

const ownKey = () => `${testUser.id}/own-file`;
const foreignKey = "another-user-id/foreign-file";
const unprefixedKey = "legacy-file-without-prefix";

describe("POST [/api/uploads/presign]", () => {
  test("should return a key prefixed with the id of the user", async () => {
    const response = await request(server.server)
      .post("/api/uploads/presign")
      .set(authHeaders)
      .send({ file: { name: "video.mp4", type: "video/mp4", size: 1024 } });

    expect(response.status).toEqual(200);
    expect(response.body.key.startsWith(`${testUser.id}/`)).toBe(true);
  });

  test("should return 404 when resuming an upload with the key of another user", async () => {
    const response = await request(server.server)
      .post("/api/uploads/presign")
      .set(authHeaders)
      .send({
        file: { name: "video.mp4", type: "video/mp4", size: 1024 },
        resume: { key: foreignKey, uploadId: "upload-id", partNumbers: [1] },
      });

    expect(response.status).toEqual(404);
  });

  test("should resume an upload with a key of the user", async () => {
    const response = await request(server.server)
      .post("/api/uploads/presign")
      .set(authHeaders)
      .send({
        file: { name: "video.mp4", type: "video/mp4", size: 1024 },
        resume: { key: ownKey(), uploadId: "upload-id", partNumbers: [1] },
      });

    expect(response.status).toEqual(200);
    expect(response.body.key).toEqual(ownKey());
  });
});

describe("multipart upload routes", () => {
  test.each([foreignKey, unprefixedKey])(
    "should return 404 for a key that is not of the user (%s)",
    async (key) => {
      const complete = await request(server.server)
        .post("/api/uploads/complete-multipart")
        .set(authHeaders)
        .send({ key, uploadId: "upload-id", parts: [{ partNumber: 1, eTag: "etag" }] });

      const abort = await request(server.server)
        .post("/api/uploads/abort-multipart")
        .set(authHeaders)
        .send({ key, uploadId: "upload-id" });

      const list = await request(server.server)
        .get("/api/uploads/list-parts")
        .query({ key, uploadId: "upload-id" })
        .set(authHeaders);

      expect([complete.status, abort.status, list.status]).toEqual([404, 404, 404]);
    },
  );
});

describe("routes that receive an upload key", () => {
  test.each([foreignKey, unprefixedKey])(
    "POST [/posts] should return 404 and create no post for the key %s",
    async (key) => {
      const response = await request(server.server)
        .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/posts`)
        .set(authHeaders)
        .send({
          posts: [
            {
              file: { name: "video.mp4", key, type: "video/mp4", size: 1024, duration: 10 },
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
        .where(eq(postsTable.channelId, channelId));
      expect(posts).toHaveLength(0);
    },
  );

  test.each([foreignKey, unprefixedKey])(
    "POST [/projects] should return 404 and create no project for the key %s",
    async (key) => {
      const response = await request(server.server)
        .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/projects`)
        .set(authHeaders)
        .send({ files: [{ name: "video.mp4", key }] });

      expect(response.status).toEqual(404);

      const projects = await db
        .select({ id: projectsTable.id })
        .from(projectsTable)
        .where(eq(projectsTable.channelId, channelId));
      expect(projects).toHaveLength(0);
    },
  );

  test.each([foreignKey, unprefixedKey])(
    "POST [/inspirational-thumbnails] should return 404 and create nothing for the key %s",
    async (key) => {
      const response = await request(server.server)
        .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/inspirational-thumbnails`)
        .set(authHeaders)
        .send({ name: "thumb.png", type: "image/png", size: 10, key });

      expect(response.status).toEqual(404);

      const thumbnails = await db
        .select({ id: inspirationalThumbnailsTable.id })
        .from(inspirationalThumbnailsTable)
        .where(eq(inspirationalThumbnailsTable.channelId, channelId));
      expect(thumbnails).toHaveLength(0);
    },
  );

  test("POST [/inspirational-thumbnails] should create a thumbnail from a key of the user", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/inspirational-thumbnails`)
      .set(authHeaders)
      .send({ name: "thumb.png", type: "image/png", size: 10, key: ownKey() });

    expect(response.status).toEqual(201);
  });

  test.each([foreignKey, unprefixedKey])(
    "PUT [/organizations/:slug] should return 404 and keep the logo for the avatar key %s",
    async (avatarKey) => {
      const response = await request(server.server)
        .put(`/api/organizations/${testOrgSlug}`)
        .set(authHeaders)
        .send({ name: "Renamed", avatarKey });

      expect(response.status).toEqual(404);

      const [organization] = await db
        .select({ logo: organizationsTable.logo })
        .from(organizationsTable)
        .where(eq(organizationsTable.slug, testOrgSlug));
      expect(organization.logo).not.toEqual(avatarKey);
    },
  );

  test("PUT [/organizations/:slug] should set the avatar from a key of the user", async () => {
    const avatarKey = ownKey();

    const response = await request(server.server)
      .put(`/api/organizations/${testOrgSlug}`)
      .set(authHeaders)
      .send({ name: "Renamed", avatarKey });

    expect(response.status).toEqual(204);

    const [organization] = await db
      .select({ logo: organizationsTable.logo })
      .from(organizationsTable)
      .where(eq(organizationsTable.slug, testOrgSlug));
    expect(organization.logo).toEqual(avatarKey);
  });
});
