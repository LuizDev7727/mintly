import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orgs/$slug/usage/")({
  component: OrgUsagePage,
});

function OrgUsagePage() {
  return <div>Hello "/orgs/$slug/usage/"!</div>;
}
