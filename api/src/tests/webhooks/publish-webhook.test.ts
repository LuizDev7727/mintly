import { describe, test, expect, vi, beforeAll, afterEach } from "vitest";
import { db } from "@/infra/db/client.ts";
import { webhooksTable } from "@/infra/db/tables/webhooks.table.ts";
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

  test("should not throw when a publish fails, and still try all of them, logging the failure", async () => {
    const publishJSON = vi
      .spyOn(qstash, "publishJSON")
      .mockRejectedValueOnce(new Error("qstash is down"))
      .mockResolvedValue({ messageId: "msg" } as never);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(publish()).resolves.toBeUndefined();

    expect(publishJSON).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls[0][0]).toContain("Failed to publish 1 of 2");
  });
});
