import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";

type RequestYoutubeIntegrationUrlParams = {
  orgSlug: string;
  channelId: string;
};

type RequestYoutubeIntegrationUrlResponse = {
  url: string;
};

const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.upload",
];

export async function requestYoutubeIntegrationUrl({
  orgSlug,
  channelId,
}: RequestYoutubeIntegrationUrlParams): Promise<RequestYoutubeIntegrationUrlResponse> {
  const googleURL = new URL("o/oauth2/v2/auth", "https://accounts.google.com");

  googleURL.searchParams.set("client_id", await getInfisicalSecret({ secretName: "GOOGLE_CLIENT_ID" }));
  googleURL.searchParams.set("redirect_uri", await getInfisicalSecret({ secretName: "GOOGLE_REDIRECT_URI" }));
  googleURL.searchParams.set("response_type", "code");
  googleURL.searchParams.set("include_granted_scopes", "true");
  googleURL.searchParams.set("state", [orgSlug, channelId].join(","));
  googleURL.searchParams.set("scope", SCOPES.join(" "));
  googleURL.searchParams.set("access_type", "offline");
  googleURL.searchParams.set("prompt", "consent");

  const url = googleURL.toString();

  return {
    url,
  };
}
