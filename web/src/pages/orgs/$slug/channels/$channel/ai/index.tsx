import { createFileRoute } from "@tanstack/react-router";
import { NoInspirationalThumbnailsSet } from "./-components/no-inspirational-thumbnails-set";
import { AddInspirationalThumbnailDialog } from "./-components/add-inspirational-thumbnail-dialog";

export const Route = createFileRoute("/orgs/$slug/channels/$channel/ai/")({
  head: () => ({
    meta: [
      {
        name: "Inspirational Thumbnails",
      },
      { title: "AI | Mintly" },
    ],
  }),
  component: AIPage,
});

function AIPage() {
  return (
    <div className="space-y-4 h-full">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium">Inspirational Thumbnails</h1>
          <p className="text-muted-foreground text-sm">
            Set inspirational thumbnails to generate thubmnail
          </p>
        </div>
        <AddInspirationalThumbnailDialog />
      </header>

      <NoInspirationalThumbnailsSet />

      {/*<AddInspirationalThumbnailsForm />*/}
      {/*<Separator />*/}

      {/*<div className="space-y-2">
        <div>
          <h2 className="font-medium">Attached Files</h2>
          <p className="text-muted-foreground text-sm">
            Inspirational thumnails that have been attached to this channel
          </p>
        </div>
        <InspirationalThumbnailCard />
        <InspirationalThumbnailCard />
        <InspirationalThumbnailCard />
      </div>*/}
    </div>
  );
}
