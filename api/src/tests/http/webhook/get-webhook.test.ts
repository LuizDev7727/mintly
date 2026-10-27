import { beforeAll, describe, expect, test } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { db } from "@/infra/db/client.ts";
import { webhooksTable } from "@/infra/db/tables/webhooks.table.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";
import { makeFakeOrganization } from "@/tests/factories/make-fake-organization.ts";

let ownWebhookId: string;
let foreignWebhookId: string;

async function makeWebhook(organizationSlug: string, signingKey: string) {
  const [{ id }] = await db
    .insert(webhooksTable)
    .values({
      url: "https://example.com/hook",
      signingKey,
      triggers: ["post.posted"],
      organizationSlug,
    })
    .returning({ id: webhooksTable.id });

  return id;
}

beforeAll(async () => {
  ownWebhookId = await makeWebhook(testOrgSlug, "own-signing-key");

  const { organizationSlug: foreignOrgSlug } = await makeFakeOrganization(testUser.id);
  foreignWebhookId = await makeWebhook(foreignOrgSlug, "foreign-signing-key");
});

// Calculada a cada uso: `testOrgSlug` só existe depois do beforeAll do setup.
const base = () => `/api/organizations/${testOrgSlug}/webhooks`;

describe("get webhook (GET /api/organizations/:slug/webhooks/:webhookId)", () => {
  test("should return the webhook of the organization with its signing secret", async () => {
    const response = await request(server.server)
      .get(`${base()}/${ownWebhookId}`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      id: ownWebhookId,
      url: "https://example.com/hook",
      signingSecret: "own-signing-key",
      logs: [],
    });
  });

  test("should return 404 and not expose the signing secret of a webhook of another organization", async () => {
    const response = await request(server.server)
      .get(`${base()}/${foreignWebhookId}`)
      .set(authHeaders);

    expect(response.status).toEqual(404);
    expect(JSON.stringify(response.body)).not.toContain("foreign-signing-key");
  });

  test("should return 404 when the webhook does not exist", async () => {
    const response = await request(server.server)
      .get(`${base()}/00000000-0000-0000-0000-000000000000`)
      .set(authHeaders);

    expect(response.status).toEqual(404);
  });
});
