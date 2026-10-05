import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orgs/$slug/channels/$channel/ai/")({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "AI tools for this channel",
      },
      { title: "AI | Mintly" },
    ],
  }),
  component: AIPage,
});

function AIPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-medium">AI</h1>
        <p className="text-sm text-muted-foreground">
          AI tools for this channel.
        </p>
      </header>
    </div>
  );
}
