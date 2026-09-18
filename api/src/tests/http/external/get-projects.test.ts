import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import { faker } from "@faker-js/faker";
import { server } from "@/app.ts";
import { db } from "@/infra/db/client.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { hashApiKey } from "@/utils/crypto/hash-api-key.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";
import { makeFakeProject } from "@/tests/factories/make-fake-project.ts";

const API_KEY = "test-external-api-key";

let channelId: string;

beforeAll(async () => {
  // The setup factory creates the organization without an API key.
  await db
    .update(organizationsTable)
    .set({ apiKeyHash: await hashApiKey(API_KEY) })
    .where(eq(organizationsTable.slug, testOrgSlug));

  const channelRes = await request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels`)
    .set(authHeaders)
    .send({ name: faker.word.noun(), description: faker.lorem.sentence() });

  channelId = channelRes.body.channelId;

  // No status override: new projects default to "ENCODING".
  await makeFakeProject(channelId, testUser.id);
  await makeFakeProject(channelId, testUser.id, { status: "SUCCESS" });
});

describe("GET [/api/v1/projects]", () => {
  test("should return 401 without an API key", async () => {
    const response = await request(server.server)
      .get("/api/v1/projects")
      .query({ channelId });

    expect(response.status).toEqual(401);
  });

  test("should return 200 including projects that are still ENCODING", async () => {
    const response = await request(server.server)
      .get("/api/v1/projects")
      .query({ channelId })
      .set("Authorization", `Bearer ${API_KEY}`);

    expect(response.status).toEqual(200);
    expect(response.body.projects).toHaveLength(2);
    expect(response.body.projects.map((p: { status: string }) => p.status)).toEqual(
      expect.arrayContaining(["ENCODING", "SUCCESS"]),
    );
    expect(response.body.meta).toHaveProperty("totalCount", 2);
  });
});
