import { describe, test, expect, beforeAll } from "vitest";
import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";
import { getIntegrationForUpload } from "@/functions/integration/get-integration-for-upload.ts";
import { testOrgSlug, testUser } from "@/tests/setup.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";
import { makeFakeOrganization } from "@/tests/factories/make-fake-organization.ts";

async function makeIntegration(
  channelId: string,
  provider: "YOUTUBE" | "TIKTOK" | "INSTAGRAM",
  name: string,
) {
  const [{ id }] = await db
    .insert(integrationsTable)
    .values({
      name,
      email: `${name}@example.com`,
      accessToken: `token-of-${name}`,
      refresh_token: `refresh-of-${name}`,
      expiry_in: 3600,
      provider,
      channelId,
    })
    .returning({ id: integrationsTable.id });

  return id;
}

let ownChannelId: string;
let otherChannelOfSameOrg: string;
let channelOfAnotherOrg: string;

let foreignYoutubeId: string;
let otherChannelYoutubeId: string;
let ownYoutubeId: string;

beforeAll(async () => {
  ({ channelId: ownChannelId } = await makeFakeChannel(testOrgSlug));
  ({ channelId: otherChannelOfSameOrg } = await makeFakeChannel(testOrgSlug));

  const { organizationSlug: anotherOrgSlug } = await makeFakeOrganization(testUser.id);
  ({ channelId: channelOfAnotherOrg } = await makeFakeChannel(anotherOrgSlug));

  // As integrações alheias do mesmo provedor são criadas ANTES da própria: era
  // a primeira linha do provedor que as tasks usavam.
  foreignYoutubeId = await makeIntegration(channelOfAnotherOrg, "YOUTUBE", "foreign");
  otherChannelYoutubeId = await makeIntegration(otherChannelOfSameOrg, "YOUTUBE", "other-channel");
  ownYoutubeId = await makeIntegration(ownChannelId, "YOUTUBE", "own");
});

describe("getIntegrationForUpload", () => {
  test("should return the integration of the channel, not the first one of the provider", async () => {
    const integration = await getIntegrationForUpload({
      integrationId: ownYoutubeId,
      channelId: ownChannelId,
      provider: "YOUTUBE",
    });

    expect(integration.id).toEqual(ownYoutubeId);
    expect(integration.accessToken).toEqual("token-of-own");
  });

  test.each([
    ["of another organization", () => foreignYoutubeId],
    ["of another channel of the same organization", () => otherChannelYoutubeId],
  ])("should not return an integration %s", async (_, getIntegrationId) => {
    await expect(
      getIntegrationForUpload({
        integrationId: getIntegrationId(),
        channelId: ownChannelId,
        provider: "YOUTUBE",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  test("should not return an integration of another provider", async () => {
    await expect(
      getIntegrationForUpload({
        integrationId: ownYoutubeId,
        channelId: ownChannelId,
        provider: "INSTAGRAM",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  test("should fail clearly when the integration does not exist", async () => {
    await expect(
      getIntegrationForUpload({
        integrationId: "does-not-exist",
        channelId: ownChannelId,
        provider: "YOUTUBE",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
