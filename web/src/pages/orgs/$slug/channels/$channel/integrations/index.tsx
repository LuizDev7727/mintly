import { createFileRoute } from "@tanstack/react-router";
import { IntegrationCard } from "./-components/integration-card";
import { TiktokIcon, YoutubeIcon } from "./-components/provider-icons";

export const Route = createFileRoute(
  "/orgs/$slug/channels/$channel/integrations/",
)({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Manage your channel integrations",
      },
      { title: "Integrations | Mintly" },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  // Demo: YouTube connected, TikTok not connected
  const youtubeAccount = {
    name: "@mintly_official",
    avatarUrl: undefined,
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-medium">Integrations</h1>
        <p className="text-muted-foreground text-sm">
          Connect your accounts to publish content directly from Mintly.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <IntegrationCard
          providerLabel="Google"
          providerIcon={<YoutubeIcon className="size-full" />}
          name="YouTube"
          description="Connect your YouTube channel to publish Shorts and manage your video content directly from Mintly."
          connectedAccount={youtubeAccount}
          onDisconnect={() => {}}
        />
        <IntegrationCard
          providerLabel="TikTok"
          providerIcon={<TiktokIcon className="size-6" />}
          name="TikTok"
          description="Connect your TikTok account to publish clips and reach your audience directly from Mintly."
          onConnect={() => {}}
        />
      </div>
    </div>
  );
}
