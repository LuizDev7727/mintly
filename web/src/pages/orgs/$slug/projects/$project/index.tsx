import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orgs/$slug/projects/$project/")({
  component: ProjectPage,
});

function ProjectPage() {
  return <div>Hello "/orgs/$slug/projects/$project/"!</div>;
}
