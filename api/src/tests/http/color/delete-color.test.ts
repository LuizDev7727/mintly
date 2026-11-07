import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";
import { uuidv7 } from "uuidv7";

let channelId: string;

beforeAll(async () => {
  ({ channelId } = await makeFakeChannel(testOrgSlug));
});

describe("DELETE [/api/organizations/:slug/channels/:channelId/colors/:colorId]", () => {
  test("should return 204 and remove the color", async () => {
    const created = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/colors`)
      .set(authHeaders)
      .send({ r: 10, g: 20, b: 30 });

    const response = await request(server.server)
      .delete(
        `/api/organizations/${testOrgSlug}/channels/${channelId}/colors/${created.body.colorId}`,
      )
      .set(authHeaders);

    expect(response.status).toEqual(204);

    const listResponse = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${channelId}/colors`)
      .set(authHeaders);

    expect(listResponse.body.colors).not.toContainEqual(
      expect.objectContaining({ id: created.body.colorId }),
    );
  });

  test("should return 404 when the color was already deleted", async () => {
    const created = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/colors`)
      .set(authHeaders)
      .send({ r: 1, g: 2, b: 3 });
    const url = `/api/organizations/${testOrgSlug}/channels/${channelId}/colors/${created.body.colorId}`;

    await request(server.server).delete(url).set(authHeaders);
    const response = await request(server.server).delete(url).set(authHeaders);

    expect(response.status).toEqual(404);
  });

  test("should return 404 for a non-existent color", async () => {
    const response = await request(server.server)
      .delete(
        `/api/organizations/${testOrgSlug}/channels/${channelId}/colors/${uuidv7()}`,
      )
      .set(authHeaders);

    expect(response.status).toEqual(404);
  });

  test("should return 401 when not authenticated", async () => {
    const response = await request(server.server).delete(
      `/api/organizations/${testOrgSlug}/channels/${channelId}/colors/${uuidv7()}`,
    );

    expect(response.status).toEqual(401);
  });
});
