import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/orgs/$slug/projects/$project/integrations/",
)({
  component: IntegrationsPage,
});

function IntegrationsPage() {
  return <div>Hello "/orgs/$slug/projects/$project/integrations/"!</div>;
}
