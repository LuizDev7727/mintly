import { describe, test, expect, vi, beforeAll, afterEach } from "vitest";
import { db } from "@/infra/db/client.ts";
import { webhooksTable } from "@/infra/db/tables/webhooks.table.ts";
import { WebhookPublishError } from "@/errors/webhook-publish.error.ts";
import { qstash } from "@/lib/qstash.ts";
import { publishWebhookEvents } from "@/webhooks/publish-webhook.ts";
import { testOrgSlug } from "@/tests/setup.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

beforeAll(async () => {
  await db.insert(webhooksTable).values(
    ["https://example.com/hook-a", "https://example.com/hook-b"].map((url) => ({
      url,
      signingKey: "signing-key",
      triggers: ["post.created" as const],
      organizationSlug: testOrgSlug,
    })),
  );
});

const publish = () =>
  publishWebhookEvents({
    orgSlug: testOrgSlug,
    trigger: "post.created",
    events: [{ message: "Post(s) created successfully." }],
  });

describe("publishWebhookEvents", () => {
  test("should do nothing when the organization has no webhook for the trigger", async () => {
    const publishJSON = vi.spyOn(qstash, "publishJSON");

    // Os webhooks do beforeAll só assinam `post.created`.
    await expect(
      publishWebhookEvents({
        orgSlug: testOrgSlug,
        trigger: "project.created",
        events: [{ message: "Project created." }],
      }),
    ).resolves.toBeUndefined();

    expect(publishJSON).not.toHaveBeenCalled();
  });

  test("should publish one message per webhook", async () => {
    const publishJSON = vi
      .spyOn(qstash, "publishJSON")
      .mockResolvedValue({ messageId: "msg" } as never);

    await expect(publish()).resolves.toBeUndefined();

    expect(publishJSON).toHaveBeenCalledTimes(2);
    const deliveredTo = publishJSON.mock.calls.map(
      ([request]) => (request.body as { deliverTo: string }).deliverTo,
    );
    expect(deliveredTo.sort()).toEqual([
      "https://example.com/hook-a",
      "https://example.com/hook-b",
    ]);
  });

  test("should reject with WebhookPublishError when a publish fails, after trying all of them", async () => {
    const publishJSON = vi
      .spyOn(qstash, "publishJSON")
      .mockRejectedValueOnce(new Error("qstash is down"))
      .mockResolvedValue({ messageId: "msg" } as never);

    const result = publish();

    await expect(result).rejects.toBeInstanceOf(WebhookPublishError);
    await expect(result).rejects.toThrow("Failed to publish 1 of 2 webhook event(s)");
    expect(publishJSON).toHaveBeenCalledTimes(2);
  });
});
