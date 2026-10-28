import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import { server } from "@/app.ts";
import { db } from "@/infra/db/client.ts";
import { oauthStatesTable } from "@/infra/db/tables/oauth-state.table.ts";
import { connectInstagram } from "@/functions/integration/connect-instagram.ts";
import { connectTikTok } from "@/functions/integration/connect-tiktok.ts";
import { connectYoutube } from "@/functions/integration/connect-youtube.ts";
import { authHeaders, testOrgSlug, testUser } from "@/tests/setup.ts";
import { makeFakeChannel } from "@/tests/factories/make-fake-channel.ts";

// O `state` que o provedor devolve no callback precisa ter sido emitido pelo
// servidor para o usuário que começou o login. Antes ele era `orgSlug,channelId`
// em texto puro, e quem montasse essa string ligava a própria conta a qualquer
// canal.

const PROVIDERS = [
  { name: "YOUTUBE", path: "youtube", connect: connectYoutube },
  { name: "TIKTOK", path: "tiktok", connect: connectTikTok },
  { name: "INSTAGRAM", path: "instagram", connect: connectInstagram },
] as const;

let channelId: string;

beforeAll(async () => {
  ({ channelId } = await makeFakeChannel(testOrgSlug));
});

beforeEach(() => {
  vi.mocked(connectYoutube).mockClear();
  vi.mocked(connectTikTok).mockClear();
  vi.mocked(connectInstagram).mockClear();
});

// A URL do provedor é montada com o `state` na query.
async function requestState(path: string) {
  const response = await request(server.server)
    .get(`/api/organizations/${testOrgSlug}/channels/${channelId}/integrations/${path}/request-url`)
    .set(authHeaders);

  expect(response.status).toEqual(200);

  return new URL(response.body.url).searchParams.get("state") as string;
}

const callback = (path: string, state: string) =>
  request(server.server).get(`/api/integrations/${path}/callback`).query({ code: "any-code", state });

describe.each(PROVIDERS)("OAuth state of $name", ({ name, path, connect }) => {
  test("should issue a random state tied to the user and channel that asked for it", async () => {
    const state = await requestState(path);

    expect(state).toMatch(/^[0-9a-f]{64}$/);

    const [stored] = await db.select().from(oauthStatesTable).where(eq(oauthStatesTable.id, state));
    expect(stored).toMatchObject({
      provider: name,
      userId: testUser.id,
      organizationSlug: testOrgSlug,
      channelId,
    });
  });

  test("should connect the channel of the state and redirect when the state is valid", async () => {
    const state = await requestState(path);

    const response = await callback(path, state);

    expect(response.status).toEqual(302);
    expect(response.headers.location).toContain(`/orgs/${testOrgSlug}/channels/${channelId}/integrations`);
    expect(connect).toHaveBeenCalledTimes(1);
    expect(connect).toHaveBeenCalledWith({ channelId, code: "any-code" });
  });

  test("should return 401 and connect nothing for a forged state naming another channel", async () => {
    const response = await callback(path, `${testOrgSlug},some-victim-channel-id`);

    expect(response.status).toEqual(401);
    expect(connect).not.toHaveBeenCalled();
  });

  test("should accept a state only once", async () => {
    const state = await requestState(path);

    expect((await callback(path, state)).status).toEqual(302);
    expect((await callback(path, state)).status).toEqual(401);
    expect(connect).toHaveBeenCalledTimes(1);
  });

  test("should return 401 and connect nothing for an expired state", async () => {
    const state = await requestState(path);

    await db
      .update(oauthStatesTable)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(oauthStatesTable.id, state));

    const response = await callback(path, state);

    expect(response.status).toEqual(401);
    expect(connect).not.toHaveBeenCalled();
  });
});

describe("OAuth state is bound to the provider that asked for it", () => {
  test("should return 401 when a YouTube state is used in the TikTok callback", async () => {
    const state = await requestState("youtube");

    const response = await callback("tiktok", state);

    expect(response.status).toEqual(401);
    expect(connectTikTok).not.toHaveBeenCalled();
  });
});

describe("requesting the URL of an integration", () => {
  test("should remove the expired states of any user when a new one is issued", async () => {
    const [expired] = await db
      .insert(oauthStatesTable)
      .values({
        id: "expired-state-to-be-removed",
        provider: "YOUTUBE",
        userId: testUser.id,
        organizationSlug: testOrgSlug,
        channelId,
        expiresAt: new Date(Date.now() - 60_000),
      })
      .returning({ id: oauthStatesTable.id });

    await requestState("youtube");

    const rows = await db.select().from(oauthStatesTable).where(eq(oauthStatesTable.id, expired.id));
    expect(rows).toHaveLength(0);
  });
});
