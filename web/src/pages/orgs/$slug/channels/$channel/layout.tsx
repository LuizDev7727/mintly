import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/orgs/$slug/channels/$channel")({
  component: ChannelLayout,
});

function ChannelLayout() {
  return <Outlet />;
}
