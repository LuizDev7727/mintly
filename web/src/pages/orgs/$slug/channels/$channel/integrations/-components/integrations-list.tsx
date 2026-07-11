import { getIntegrationsHttp } from "@/http/integration/get-integrations.http";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { YoutubeIntegrationCard } from "./youtube-integration-card";
import { TiktokIntegrationCard } from "./tiktok-integration-card";

export function IntegrationsList() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const { data } = useSuspenseQuery({
    queryKey: ["integrations", slug, channel],
    queryFn: () =>
      getIntegrationsHttp({
        channelId: channel,
      }),
  });

  const { integrations } = data;

  const youtubeIntegration =
    integrations.find((i) => i.provider === "YOUTUBE");
  const tiktokIntegration =
    integrations.find((i) => i.provider === "TIKTOK");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <YoutubeIntegrationCard integration={youtubeIntegration} />
      <TiktokIntegrationCard integration={tiktokIntegration} />
    </div>
  );
}
