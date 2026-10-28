import { createFileRoute } from "@tanstack/react-router";
import { VideoPlayground } from "./-components/video-playground";

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
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-medium">AI</h1>
        <p className="text-sm text-muted-foreground">
          Describe the video you want and keep track of what you've generated.
        </p>
      </header>

      <VideoPlayground />
    </div>
  );
}
