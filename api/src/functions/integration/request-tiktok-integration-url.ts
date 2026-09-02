import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";

type RequestTiktokIntegrationUrlProps = {
  orgSlug: string;
  channelId: string;
};

export async function requestTiktokIntegrationUrl({
  orgSlug,
  channelId,
}: RequestTiktokIntegrationUrlProps) {
  const tiktokURL = new URL("https://www.tiktok.com/v2/auth/authorize/");

  const scopes = ["user.info.basic", "video.upload", "video.publish"];

  tiktokURL.searchParams.set("client_key", await getInfisicalSecret({ secretName: "TIKTOK_CLIENT_KEY" }));
  tiktokURL.searchParams.set("scope", scopes.join(","));
  tiktokURL.searchParams.set("redirect_uri", await getInfisicalSecret({ secretName: "TIKTOK_REDIRECT_URI" }));
  tiktokURL.searchParams.set("response_type", "code");
  tiktokURL.searchParams.set("state", [orgSlug, channelId].join(","));

  return {
    url: tiktokURL.toString(),
  };
}
