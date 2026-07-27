import { env } from "@/env.ts";

type RequestTiktokIntegrationUrlProps = {
  orgSlug: string;
  channelId: string;
};

export function requestTiktokIntegrationUrl({
  orgSlug,
  channelId,
}: RequestTiktokIntegrationUrlProps) {
  const tiktokURL = new URL("https://www.tiktok.com/v2/auth/authorize/");

  const scopes = ["user.info.basic", "video.upload", "video.publish"];

  tiktokURL.searchParams.set("client_key", env.TIKTOK_CLIENT_KEY);
  tiktokURL.searchParams.set("scope", scopes.join(","));
  tiktokURL.searchParams.set("redirect_uri", env.TIKTOK_REDIRECT_URI);
  tiktokURL.searchParams.set("response_type", "code");
  tiktokURL.searchParams.set("state", [orgSlug, channelId].join(","));

  return {
    url: tiktokURL.toString(),
  };
}
