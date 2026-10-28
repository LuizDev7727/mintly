import { beforeAll, describe, expect, test } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { db } from "@/infra/db/client.ts";
import { webhookLogsTable } from "@/infra/db/tables/webhook-log.table.ts";
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

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

async function makeLogs(webhookId: string, createdAts: Date[]) {
  await db.insert(webhookLogsTable).values(
    createdAts.map((createdAt) => ({
      url: "https://example.com/hook",
      signingKey: "key",
      method: "POST",
      pathname: "/hook",
      statusCode: 200,
      headers: {},
      webhookId,
      createdAt,
    })),
  );
}

describe("delivery logs of GET /api/organizations/:slug/webhooks/:webhookId", () => {
  test("should return only the deliveries of the last 7 days, newest first", async () => {
    const webhookId = await makeWebhook(testOrgSlug, "logs-window-key");
    const now = Date.now();

    await makeLogs(webhookId, [
      new Date(now - 8 * DAY),
      new Date(now - 6 * DAY),
      new Date(now - HOUR),
    ]);

    const response = await request(server.server)
      .get(`${base()}/${webhookId}`)
      .set(authHeaders);

    expect(response.status).toEqual(200);

    const createdAts = response.body.logs.map((log: { createdAt: string }) =>
      new Date(log.createdAt).getTime(),
    );
    expect(createdAts).toHaveLength(2);
    expect(createdAts[0]).toBeGreaterThan(createdAts[1]);
    expect(createdAts[1]).toBeGreaterThan(now - 7 * DAY);
  });

  test("should return at most 500 deliveries, keeping the newest", async () => {
    const webhookId = await makeWebhook(testOrgSlug, "logs-limit-key");
    const now = Date.now();

    // 501 entregas, uma por minuto: a mais antiga (índice 500) fica de fora.
    const createdAts = Array.from({ length: 501 }, (_, minute) => new Date(now - minute * 60_000));
    await makeLogs(webhookId, createdAts);

    const response = await request(server.server)
      .get(`${base()}/${webhookId}`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body.logs).toHaveLength(500);

    const oldest = Math.min(
      ...response.body.logs.map((log: { createdAt: string }) => new Date(log.createdAt).getTime()),
    );
    expect(oldest).toBeGreaterThan(createdAts[500].getTime());
  });

  test("should not return the deliveries of another webhook", async () => {
    const webhookId = await makeWebhook(testOrgSlug, "logs-isolation-key");

    const response = await request(server.server)
      .get(`${base()}/${webhookId}`)
      .set(authHeaders);

    expect(response.body.logs).toEqual([]);
  });
});
