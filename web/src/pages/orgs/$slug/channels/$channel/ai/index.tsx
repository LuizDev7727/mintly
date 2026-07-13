import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { AddInspirationalThumbnailsForm } from "./-components/add-inspirational-thumbnails-form";
import { Suspense } from "react";
import { InspirationalThumbnails } from "./-components/inspirational-thubmnails";

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
      </header>

      <AddInspirationalThumbnailsForm/>

      <Separator />

      <Suspense fallback={<div>Loading...</div>}>
        <InspirationalThumbnails/>
      </Suspense>

    </div>
  );
}
