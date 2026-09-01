import { db } from "@/infra/db/client.ts";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

type ConnectTikTokParams = {
  channelId: string;
  code: string;
};

const TikTokTokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  refresh_expires_in: z.number(),
  open_id: z.string(),
});

const TikTokProfileSchema = z.object({
  data: z.object({
    user: z.object({
      open_id: z.string(),
      display_name: z.string(),
      avatar_url: z.string(),
    }),
  }),
});

export async function connectTikTok(params: ConnectTikTokParams) {
  const { channelId, code } = params;

  const nowInSeconds = Math.floor(Date.now() / 1000);

  const tokenRequest = await fetch(
    "https://open.tiktokapis.com/v2/oauth/token/",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: await getInfisicalSecret({ secretName: "TIKTOK_CLIENT_KEY" }),
        client_secret: await getInfisicalSecret({ secretName: "TIKTOK_CLIENT_SECRET" }),
        code,
        grant_type: "authorization_code",
        redirect_uri: await getInfisicalSecret({ secretName: "TIKTOK_REDIRECT_URI" }),
      }),
    },
  );

  if (!tokenRequest.ok) {
    throw new Error("Failed to exchange TikTok OAuth code.");
  }

  const tiktokTokenResponse = await tokenRequest.json();

  console.log({ tiktokTokenResponse });

  const {
    access_token: accessToken,
    expires_in: expiresIn,
    refresh_token: refreshToken,
    refresh_expires_in: refreshExpiresIn,
    open_id: openId,
  } = TikTokTokenSchema.parse(tiktokTokenResponse);

  const profileRequest = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!profileRequest.ok) {
    throw new Error("Failed to fetch TikTok account profile.");
  }

  const {
    data: {
      user: { display_name: name, avatar_url: avatarUrl },
    },
  } = TikTokProfileSchema.parse(await profileRequest.json());

  const [existing] = await db
    .select({ id: integrationsTable.id })
    .from(integrationsTable)
    .where(
      and(
        eq(integrationsTable.channelId, channelId),
        eq(integrationsTable.provider, "TIKTOK"),
        eq(integrationsTable.email, openId),
      ),
    );

  if (!existing) {
    await db.insert(integrationsTable).values({
      name,
      email: openId,
      avatarUrl,
      accessToken,
      refresh_token: refreshToken,
      expiry_in: nowInSeconds + expiresIn,
      refreshExpiresIn: nowInSeconds + refreshExpiresIn,
      provider: "TIKTOK",
      channelId,
    });
  } else {
    await db
      .update(integrationsTable)
      .set({
        name,
        avatarUrl,
        accessToken,
        refresh_token: refreshToken,
        expiry_in: nowInSeconds + expiresIn,
        refreshExpiresIn: nowInSeconds + refreshExpiresIn,
      })
      .where(eq(integrationsTable.id, existing.id));
  }
}
