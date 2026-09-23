import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { faker } from "@faker-js/faker";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";
import { makeFakeOrganization } from "@/tests/factories/make-fake-organization.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";

let ownChannelId: string;
let channelOfAnotherOrg: string;

beforeAll(async () => {
  ({ channelId: ownChannelId } = await makeFakeChannel(testOrgSlug));

  const { organizationSlug: anotherOrgSlug } = await makeFakeOrganization(testUser.id);
  ({ channelId: channelOfAnotherOrg } = await makeFakeChannel(anotherOrgSlug));
});

describe("GET [/api/organizations/:slug/channels/:channelId]", () => {
  test("should return 200 with the channel of the organization", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${ownChannelId}`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("id", ownChannelId);
  });

  test("should return 404 for a channel that does not exist", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${faker.string.uuid()}`)
      .set(authHeaders);

    expect(response.status).toEqual(404);
  });

  test("should return 404 when the channel belongs to another organization", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels/${channelOfAnotherOrg}`)
      .set(authHeaders);

    expect(response.status).toEqual(404);
    expect(response.body).not.toHaveProperty("name");
  });
});
