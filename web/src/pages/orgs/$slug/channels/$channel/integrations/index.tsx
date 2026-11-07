import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { IntegrationListLoading } from "./-components/integration-list-loading";
import { IntegrationsList } from "./-components/integrations-list";

export const Route = createFileRoute("/orgs/$slug/channels/$channel/integrations/")({
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
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-medium">Integrations</h1>
        <p className="text-muted-foreground text-sm">
          Connect your accounts to publish content directly from Mintly.
        </p>
      </header>

      <Suspense fallback={<IntegrationListLoading />}>
        <IntegrationsList />
      </Suspense>
    </div>
  );
}
