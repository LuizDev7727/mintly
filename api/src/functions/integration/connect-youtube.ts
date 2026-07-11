import { db } from "@/infra/db/client.ts";
import { env } from "@/env.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

type ConnectYoutubeParams = {
  channelId: string;
  code: string;
};

export async function connectYoutube(params: ConnectYoutubeParams) {
  const { channelId, code } = params;

  const googleOauthUrl = new URL("https://oauth2.googleapis.com/token");
  googleOauthUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  googleOauthUrl.searchParams.set("client_secret", env.GOOGLE_CLIENT_SECRET);
  googleOauthUrl.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI);
  googleOauthUrl.searchParams.set("grant_type", "authorization_code");
  googleOauthUrl.searchParams.set("access_type", "offline");
  googleOauthUrl.searchParams.set("prompt", "consent");
  googleOauthUrl.searchParams.set("code", code);

  const tokenRequest = await fetch(googleOauthUrl, {
    method: "POST",
    headers: { Accept: "application/json" },
  });

  if (!tokenRequest.ok) {
    throw new Error(`Failed to exchange YouTube OAuth code: ${code}`);
  }

  const tokenResponse = await tokenRequest.json();

  const {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
  } = tokenResponse;

  const profileRequest = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!profileRequest.ok) {
    throw new Error("Failed to fetch YouTube account profile.");
  }

  const profileBody = await profileRequest.json();

  const { name, picture, email } = z
    .object({
      email: z.string(),
      name: z.string(),
      picture: z.string(),
    })
    .parse(profileBody);

  const [existing] = await db
    .select({ id: integrationsTable.id })
    .from(integrationsTable)
    .where(
      and(
        eq(integrationsTable.channelId, channelId),
        eq(integrationsTable.provider, "YOUTUBE"),
      ),
    );

  if (!existing) {
    await db.insert(integrationsTable).values({
      name,
      email,
      avatarUrl: picture,
      accessToken,
      refresh_token: refreshToken,
      expiry_in: expiresIn,
      provider: "YOUTUBE",
      channelId,
    });
  } else {
    await db
      .update(integrationsTable)
      .set({
        name,
        email,
        avatarUrl: picture,
        accessToken,
        refresh_token: refreshToken,
        expiry_in: expiresIn,
      })
      .where(eq(integrationsTable.id, existing.id));
  }
}
