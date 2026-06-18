import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orgs/$slug/channels/$channel/ai/")({
  component: AIPage,
});

function AIPage() {
  return <div>Hello "/orgs/$slug/channels/$channel/ai/"!</div>;
}
