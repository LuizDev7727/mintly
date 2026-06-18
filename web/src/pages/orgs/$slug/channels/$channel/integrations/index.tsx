import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/orgs/$slug/channels/$channel/integrations/",
)({
  component: IntegrationsPage,
});

function IntegrationsPage() {
  return <div>Hello "/orgs/$slug/channels/$channel/integrations/"!</div>;
}
