import { describe, test, expect, vi, beforeAll, afterEach } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { db } from "@/infra/db/client.ts";
import { webhooksTable } from "@/infra/db/tables/webhooks.table.ts";
import { qstash } from "@/lib/qstash.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";

let channelId: string;

beforeAll(async () => {
  ({ channelId } = await makeFakeChannel(testOrgSlug));

  await db.insert(webhooksTable).values({
    url: "https://example.com/project-created",
    signingKey: "key",
    triggers: ["project.created"],
    organizationSlug: testOrgSlug,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST [/api/organizations/:slug/channels/:channelId/projects]", () => {
  test("should publish the project.created webhook after creating the project", async () => {
    const publishJSON = vi
      .spyOn(qstash, "publishJSON")
      .mockResolvedValue({ messageId: "msg" } as never);

    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/projects`)
      .set(authHeaders)
      .send({ files: [{ name: "video.mp4", key: `${testUser.id}/video` }] });

    expect(response.status).toEqual(201);
    expect(publishJSON).toHaveBeenCalledTimes(1);

    const [published] = publishJSON.mock.calls[0];
    expect(published.body).toMatchObject({
      deliverTo: "https://example.com/project-created",
      trigger: "project.created",
      payload: { message: "Project(s) created successfully." },
    });
  });
});
