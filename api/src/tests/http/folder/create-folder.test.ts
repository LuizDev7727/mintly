import { faker } from "@faker-js/faker";
import request from "supertest";
import { beforeAll, describe, expect, test } from "vitest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";

let channelId: string;

beforeAll(async () => {
  const res = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels`)
    .set(authHeaders)
    .send({ name: faker.word.noun(), description: faker.lorem.sentence() });

  channelId = res.body.channelId;
});

describe("POST [/api/organizations/:orgSlug/channels/:channelId/folders]", () => {
  test("should return 201 with folderId", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
      .set(authHeaders)
      .send({ title: faker.word.noun(), parentId: null });

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("folderId");
    expect(typeof response.body.folderId).toBe("string");
  });

  test("should return 409 when folder with same title already exists", async () => {
    const title = faker.word.noun();

    await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
      .set(authHeaders)
      .send({ title, parentId: null });

    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
      .set(authHeaders)
      .send({ title, parentId: null });

    expect(response.status).toEqual(409);
  });

  test("should return 400 when title is empty", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
      .set(authHeaders)
      .send({ title: "", parentId: null });

    expect(response.status).toEqual(400);
  });

  test("should return 400 when body is missing", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
      .set(authHeaders)
      .send({});

    expect(response.status).toEqual(400);
  });

  test("should return 201 when creating a nested folder", async () => {
    const parentRes = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
      .set(authHeaders)
      .send({ title: faker.word.noun(), parentId: null });

    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/folders`)
      .set(authHeaders)
      .send({ title: faker.word.noun(), parentId: parentRes.body.folderId });

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("folderId");
  });
});
