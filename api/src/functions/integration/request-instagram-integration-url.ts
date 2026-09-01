import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";

type RequestInstagramIntegrationUrlParams = {
  orgSlug: string;
  channelId: string;
};

type RequestInstagramIntegrationUrlResponse = {
  url: string;
};

const SCOPES = [
  "instagram_business_basic",
  "instagram_business_content_publish",
];

export async function requestInstagramIntegrationUrl({
  orgSlug,
  channelId,
}: RequestInstagramIntegrationUrlParams): Promise<RequestInstagramIntegrationUrlResponse> {
  const instagramURL = new URL("https://api.instagram.com/oauth/authorize");

  instagramURL.searchParams.set("client_id", await getInfisicalSecret({ secretName: "INSTAGRAM_APP_ID" }));
  instagramURL.searchParams.set("redirect_uri", await getInfisicalSecret({ secretName: "INSTAGRAM_REDIRECT_URI" }));
  instagramURL.searchParams.set("response_type", "code");
  instagramURL.searchParams.set("scope", SCOPES.join(","));
  instagramURL.searchParams.set("state", [orgSlug, channelId].join(","));

  const url = instagramURL.toString();

  return {
    url,
  };
}
