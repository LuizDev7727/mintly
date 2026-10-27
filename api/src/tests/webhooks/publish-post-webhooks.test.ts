import { describe, test, expect, vi, beforeAll, afterEach } from "vitest";
import { db } from "@/infra/db/client.ts";
import { webhooksTable } from "@/infra/db/tables/webhooks.table.ts";
import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { qstash } from "@/lib/qstash.ts";
import {
  publishPostFailedWebhook,
  publishPostPostedWebhook,
} from "@/webhooks/publish-post-webhooks.ts";
import { testOrgSlug } from "@/tests/setup.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";

let channelId: string;

beforeAll(async () => {
  ({ channelId } = await makeFakeChannel(testOrgSlug));

  // Um webhook para cada evento; o `post.created` não deve ser tocado.
  await db.insert(webhooksTable).values([
    {
      url: "https://example.com/posted",
      signingKey: "key",
      triggers: ["post.posted"],
      organizationSlug: testOrgSlug,
    },
    {
      url: "https://example.com/failed",
      signingKey: "key",
      triggers: ["post.failed"],
      organizationSlug: testOrgSlug,
    },
  ]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function spyOnPublish() {
  return vi
    .spyOn(qstash, "publishJSON")
    .mockResolvedValue({ messageId: "msg" } as never);
}

describe("publishPostPostedWebhook", () => {
  test("should publish post.posted to the webhooks of the organization of the channel", async () => {
    const publishJSON = spyOnPublish();

    await publishPostPostedWebhook({
      channelId,
      title: "My video",
      description: "About something",
      tags: ["a", "b"],
    });

    expect(publishJSON).toHaveBeenCalledTimes(1);
    const [request] = publishJSON.mock.calls[0];
    expect(request.body).toMatchObject({
      deliverTo: "https://example.com/posted",
      trigger: "post.posted",
      payload: { title: "My video", description: "About something", tags: ["a", "b"] },
    });
  });

  test("should fail when the channel does not exist", async () => {
    spyOnPublish();

    await expect(
      publishPostPostedWebhook({
        channelId: "does-not-exist",
        title: "t",
        description: "d",
        tags: [],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

describe("publishPostFailedWebhook", () => {
  test("should publish post.failed to the webhooks that subscribe to it", async () => {
    const publishJSON = spyOnPublish();

    await publishPostFailedWebhook({
      channelId,
      message: "Failed to process the post: Step \"transcribe-audio\" failed",
    });

    expect(publishJSON).toHaveBeenCalledTimes(1);
    const [request] = publishJSON.mock.calls[0];
    expect(request.body).toMatchObject({
      deliverTo: "https://example.com/failed",
      trigger: "post.failed",
      payload: { message: "Failed to process the post: Step \"transcribe-audio\" failed" },
    });
  });
});
