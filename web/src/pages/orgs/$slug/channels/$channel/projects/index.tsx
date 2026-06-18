import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orgs/$slug/channels/$channel/projects/")(
  {
    component: ChannelProjectsPage,
  },
);

function ChannelProjectsPage() {
  return <div>Hello "/orgs/$slug/channels/$channel/projects/"!</div>;
}
