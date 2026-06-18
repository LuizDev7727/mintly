import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orgs/$slug/channels/$channel/settings/")(
  {
    component: ChannelSettingsPage,
  },
);

function ChannelSettingsPage() {
  return <div>Hello "/orgs/$slug/channels/$channel/settings/"!</div>;
}
