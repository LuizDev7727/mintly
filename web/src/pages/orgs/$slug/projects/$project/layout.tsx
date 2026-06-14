import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/orgs/$slug/projects/$project")({
  component: ProjectLayout,
});

function ProjectLayout() {
  return <Outlet />;
}
