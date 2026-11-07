import request from "supertest";
import { uuidv7 } from "uuidv7";
import { beforeAll, describe, expect, test } from "vitest";
import { server } from "@/app.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";

let channelId: string;

beforeAll(async () => {
  ({ channelId } = await makeFakeChannel(testOrgSlug));
});

describe("POST [/api/organizations/:slug/channels/:channelId/colors]", () => {
  test("should return 201 and store the color as hex", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/colors`)
      .set(authHeaders)
      .send({ r: 163, g: 230, b: 53 });

    expect(response.status).toEqual(201);

    const listResponse = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${channelId}/colors`)
      .set(authHeaders);

    expect(listResponse.body.colors).toContainEqual(
      expect.objectContaining({ id: response.body.colorId, hex: "#a3e635" }),
    );
  });

  test("should zero-pad channels below 16 in the hex", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/colors`)
      .set(authHeaders)
      .send({ r: 0, g: 5, b: 15 });

    expect(response.status).toEqual(201);

    const listResponse = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${channelId}/colors`)
      .set(authHeaders);

    expect(listResponse.body.colors).toContainEqual(
      expect.objectContaining({ id: response.body.colorId, hex: "#00050f" }),
    );
  });

  test("should return 409 when the channel already has 5 colors", async () => {
    const { channelId: fullChannelId } = await makeFakeChannel(testOrgSlug);
    const url = `/api/organizations/${testOrgSlug}/channels/${fullChannelId}/colors`;

    for (let i = 0; i < 5; i++) {
      const created = await request(server.server)
        .post(url)
        .set(authHeaders)
        .send({ r: i, g: i, b: i });

      expect(created.status).toEqual(201);
    }

    const response = await request(server.server)
      .post(url)
      .set(authHeaders)
      .send({ r: 9, g: 9, b: 9 });

    expect(response.status).toEqual(409);
    expect(response.body.message).toEqual("Color limit reached for this channel");
  });

  test("should return 400 when a channel is out of the 0-255 range", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/colors`)
      .set(authHeaders)
      .send({ r: 256, g: 0, b: 0 });

    expect(response.status).toEqual(400);
  });

  test("should return 400 when a channel is missing", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/colors`)
      .set(authHeaders)
      .send({ r: 10, g: 10 });

    expect(response.status).toEqual(400);
  });

  test("should return 404 for a non-existent channel", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${uuidv7()}/colors`)
      .set(authHeaders)
      .send({ r: 10, g: 10, b: 10 });

    expect(response.status).toEqual(404);
  });

  test("should return 401 when not authenticated", async () => {
    const response = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels/${channelId}/colors`)
      .send({ r: 10, g: 10, b: 10 });

    expect(response.status).toEqual(401);
  });
});
