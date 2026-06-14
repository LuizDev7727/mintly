import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orgs/$slug/projects/$project/settings/")(
  {
    component: ProjectSettingsPage,
  },
);

function ProjectSettingsPage() {
  return <div>Hello "/orgs/$slug/projects/$project/settings/"!</div>;
}
