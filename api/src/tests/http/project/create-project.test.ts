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
    expect((published.body as { payload: { eventId?: string } }).payload.eventId).toEqual(
      expect.any(String),
    );
  });

  // O projeto já foi criado quando o webhook é publicado: um erro aqui faria o
  // cliente tentar de novo e duplicar o projeto.
  test("should still return 201 when the webhook cannot be published", async () => {
    vi.spyOn(qstash, "publishJSON").mockRejectedValue(new Error("qstash is down"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/projects`)
      .set(authHeaders)
      .send({ files: [{ name: "video.mp4", key: `${testUser.id}/video` }] });

    expect(response.status).toEqual(201);
  });

  // O QStash descarta mensagens de corpo idêntico: o evento de duas criações
  // seguidas não pode ser o mesmo.
  test("should publish a different project.created body for each request", async () => {
    const publishJSON = vi
      .spyOn(qstash, "publishJSON")
      .mockResolvedValue({ messageId: "msg" } as never);

    for (const name of ["first", "second"]) {
      const response = await request(server.server)
        .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/projects`)
        .set(authHeaders)
        .send({ files: [{ name: `${name}.mp4`, key: `${testUser.id}/${name}` }] });

      expect(response.status).toEqual(201);
    }

    const [first, second] = publishJSON.mock.calls.map(([request]) => JSON.stringify(request.body));
    expect(first).not.toEqual(second);
  });
});
