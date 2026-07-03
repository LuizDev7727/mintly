import { getIntegrationsHttp } from "@/http/integration/get-integrations.http";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { IntegrationCard } from "./integration-card";
import { TiktokIcon } from "./provider-icons";
import { YoutubeIcon } from "./provider-icons";

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

  const youtubeAccount = integrations?.find((i) => i.provider === "YOUTUBE");
  const tiktokAccount = integrations?.find((i) => i.provider === "TIKTOK");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <IntegrationCard
        providerLabel="Google"
        providerIcon={<YoutubeIcon />}
        name="YouTube"
        description="Connect your YouTube channel to publish Shorts and manage your video content directly from Mintly."
        connectedAccount={youtubeAccount}
        onDisconnect={() => {}}
      />
      <IntegrationCard
        providerLabel="TikTok"
        providerIcon={<TiktokIcon />}
        connectedAccount={tiktokAccount}
        name="TikTok"
        description="Connect your TikTok account to publish clips and reach your audience directly from Mintly."
        onConnect={() => {}}
      />
    </div>
  );
}
