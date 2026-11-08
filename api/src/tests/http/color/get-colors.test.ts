import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";
import { uuidv7 } from "uuidv7";

let channelId: string;
let otherChannelId: string;

function addColor(channel: string, rgb: { r: number; g: number; b: number }) {
  return request(server.server)
    .post(`/api/organizations/${testOrgSlug}/channels/${channel}/colors`)
    .set(authHeaders)
    .send(rgb);
}

beforeAll(async () => {
  ({ channelId } = await makeFakeChannel(testOrgSlug));
  ({ channelId: otherChannelId } = await makeFakeChannel(testOrgSlug));
});

describe("GET [/api/organizations/:slug/channels/:channelId/colors]", () => {
  test("should return 200 with an empty list for a channel without colors", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${channelId}/colors`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body.colors).toEqual([]);
  });

  test("should return only the colors of the channel, oldest first", async () => {
    const first = await addColor(channelId, { r: 255, g: 0, b: 0 });
    const second = await addColor(channelId, { r: 0, g: 255, b: 0 });
    await addColor(otherChannelId, { r: 0, g: 0, b: 255 });

    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${channelId}/colors`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body.colors).toEqual([
      expect.objectContaining({ id: first.body.colorId, hex: "#ff0000" }),
      expect.objectContaining({ id: second.body.colorId, hex: "#00ff00" }),
    ]);
  });

  test("should return 404 for a non-existent channel", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${uuidv7()}/colors`)
      .set(authHeaders);

    expect(response.status).toEqual(404);
  });

  test("should return 401 when not authenticated", async () => {
    const response = await request(server.server).get(
      `/api/organizations/${testOrgSlug}/channels/${channelId}/colors`,
    );

    expect(response.status).toEqual(401);
  });
});
