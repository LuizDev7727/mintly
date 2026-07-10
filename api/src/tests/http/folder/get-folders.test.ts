import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";
import { faker } from "@faker-js/faker";
import { uuidv7 } from "uuidv7";

let channelId: string;
let folderTitle: string;
let folderId: string;
let subFolderTitle: string;
let subFolderId: string;

beforeAll(async () => {
  const channelRes = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels`)
    .set(authHeaders)
    .send({ name: faker.word.noun() });

  channelId = channelRes.body.channelId;

  folderTitle = faker.word.noun();
  const folderRes = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
    .set(authHeaders)
    .send({ title: folderTitle, parentId: null });

  folderId = folderRes.body.folderId;

  subFolderTitle = faker.word.noun();
  const subFolderRes = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
    .set(authHeaders)
    .send({ title: subFolderTitle, parentId: folderId });

  subFolderId = subFolderRes.body.folderId;
});

describe("GET [/api/organizations/:orgSlug/channels/:channelId/folders]", () => {
  test("should return 200 with folders array at root level", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body.folders)).toBe(true);
    expect(response.body.parent).toBeNull();
  });

  test("should return meta with pagination info", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body.meta).toHaveProperty("totalCount");
    expect(response.body.meta).toHaveProperty("totalPages");
  });

  test("should return subfolders when navigating into a folder", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
      .query({ folderId })
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body.folders).toHaveLength(1);
    expect(response.body.folders[0].title).toBe(subFolderTitle);
  });

  test("should return null parent for a root-level folder", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
      .query({ folderId })
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body.parent).toBeNull();
  });

  test("should return parent info when navigating into a nested folder", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
      .query({ folderId: subFolderId })
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body.parent).not.toBeNull();
    expect(response.body.parent.title).toBe(folderTitle);
  });

  test("should return 404 when folder does not exist", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
      .query({ folderId: uuidv7() })
      .set(authHeaders);

    expect(response.status).toEqual(404);
  });
});
