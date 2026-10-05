import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";
import { faker } from "@faker-js/faker";

let channelId: string;
let rootTitle: string;
let rootId: string;
let childTitle: string;
let childId: string;
let grandchildTitle: string;

async function createFolder(title: string, parentId: string | null) {
  const response = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
    .set(authHeaders)
    .send({ title, parentId });

  return response.body.folderId as string;
}

beforeAll(async () => {
  const channelRes = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels`)
    .set(authHeaders)
    .send({ name: faker.word.noun(), description: faker.lorem.sentence() });

  channelId = channelRes.body.channelId;

  rootTitle = `root-${faker.word.noun()}`;
  childTitle = `child-${faker.word.noun()}`;
  grandchildTitle = `grandchild-${faker.word.noun()}`;

  rootId = await createFolder(rootTitle, null);
  childId = await createFolder(childTitle, rootId);
  await createFolder(grandchildTitle, childId);
});

describe("GET [/api/organizations/:orgSlug/channels/:channelId/folders/tree]", () => {
  test("should return all folders in depth-first order with their depth", async () => {
    const response = await request(server.server)
      .get(
        `/api/organizations/${testOrgSlug}/channels/${channelId}/folders/tree`,
      )
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(
      response.body.folders.map(
        (folder: { title: string; depth: number }) => [
          folder.title,
          folder.depth,
        ],
      ),
    ).toEqual([
      [rootTitle, 0],
      [childTitle, 1],
      [grandchildTitle, 2],
    ]);
  });

  test("should flag which folders have children", async () => {
    const response = await request(server.server)
      .get(
        `/api/organizations/${testOrgSlug}/channels/${channelId}/folders/tree`,
      )
      .set(authHeaders);

    const hasChildrenByTitle = Object.fromEntries(
      response.body.folders.map(
        (folder: { title: string; hasChildren: boolean }) => [
          folder.title,
          folder.hasChildren,
        ],
      ),
    );

    expect(hasChildrenByTitle[rootTitle]).toBe(true);
    expect(hasChildrenByTitle[childTitle]).toBe(true);
    expect(hasChildrenByTitle[grandchildTitle]).toBe(false);
  });

  test("should return parentId for nested folders", async () => {
    const response = await request(server.server)
      .get(
        `/api/organizations/${testOrgSlug}/channels/${channelId}/folders/tree`,
      )
      .set(authHeaders);

    const child = response.body.folders.find(
      (folder: { id: string }) => folder.id === childId,
    );

    expect(child.parentId).toBe(rootId);
  });

  test("should return 401 when unauthenticated", async () => {
    const response = await request(server.server).get(
      `/api/organizations/${testOrgSlug}/channels/${channelId}/folders/tree`,
    );

    expect(response.status).toEqual(401);
  });
});
