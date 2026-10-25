import { describe, test, expect, vi, beforeAll, afterEach } from "vitest";
import { and, eq } from "drizzle-orm";
import { db } from "@/infra/db/client.ts";
import { webhookLogsTable } from "@/infra/db/tables/webhook-log.table.ts";
import { webhooksTable } from "@/infra/db/tables/webhooks.table.ts";
import { handleWebhookEvent } from "@/webhooks/handle-webhook-event.ts";
import { testOrgSlug } from "@/tests/setup.ts";

let webhookId: string;

beforeAll(async () => {
  [{ id: webhookId }] = await db
    .insert(webhooksTable)
    .values({
      url: "https://example.com/hooks/events",
      signingKey: "signing-key",
      triggers: ["post.created"],
      organizationSlug: testOrgSlug,
    })
    .returning({ id: webhooksTable.id });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function deliver(deliverTo: string) {
  return handleWebhookEvent({
    deliverTo,
    webhookId,
    trigger: "post.created",
    numberOfRetries: 0,
    payload: { message: "Post(s) created successfully." },
  });
}

// Cada teste usa uma URL diferente: é por ela que o log da entrega é achado.
async function logOf(deliverTo: string) {
  const [log] = await db
    .select()
    .from(webhookLogsTable)
    .where(
      and(
        eq(webhookLogsTable.webhookId, webhookId),
        eq(webhookLogsTable.url, deliverTo),
      ),
    );

  return log;
}

describe("handleWebhookEvent", () => {
  test("should log the path of the destination URL, without the query string", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok", { status: 200 }));

    const result = await deliver("https://example.com/hooks/events?token=abc");
    const log = await logOf("https://example.com/hooks/events?token=abc");

    expect(result).toEqual({ success: true });
    expect(log.pathname).toEqual("/hooks/events");
    expect(log.url).toEqual("https://example.com/hooks/events?token=abc");
    expect(log.status).toEqual("SUCCESS");
  });

  test("should log / when the destination URL has no path", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok", { status: 200 }));

    await deliver("https://example.com");

    expect((await logOf("https://example.com")).pathname).toEqual("/");
  });

  test("should keep the path and mark the delivery as failed when the endpoint answers an error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("boom", { status: 500 }));

    const result = await deliver("https://example.com/hooks/events");
    const log = await logOf("https://example.com/hooks/events");

    expect(result).toEqual({ success: false });
    expect(log.pathname).toEqual("/hooks/events");
    expect(log.status).toEqual("FAILED");
    expect(log.statusCode).toEqual(500);
  });
});
