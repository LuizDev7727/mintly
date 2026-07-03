import { createFileRoute } from "@tanstack/react-router";
import { IntegrationCard } from "./-components/integration-card";
import { TiktokIcon, YoutubeIcon } from "./-components/provider-icons";
import { Suspense } from "react";
import { IntegrationsList } from "./-components/integrations-list";

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

      <Suspense fallback={<p>Loading...</p>}>
        <IntegrationsList />
      </Suspense>
    </div>
  );
}
