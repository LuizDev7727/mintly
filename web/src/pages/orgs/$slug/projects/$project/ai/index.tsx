import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orgs/$slug/projects/$project/ai/")({
  component: AIPage,
});

function AIPage() {
  return <div>Hello "/orgs/$slug/projects/$project/ai/"!</div>;
}
