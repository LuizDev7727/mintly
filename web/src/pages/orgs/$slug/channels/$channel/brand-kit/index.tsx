import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { BrandColors } from "./-components/brand-colors";
import { InspirationalThumbnails } from "./-components/inspirational-thubmnails";
import { InspirationalThumbnailsSkeleton } from "./-components/inspirational-thumbnails-skeleton";

export const Route = createFileRoute("/orgs/$slug/channels/$channel/brand-kit/")({
  head: () => ({
    meta: [
      { title: "Brand Kit | Mintly" },
      {
        name: "description",
        content: "Brand colors and inspirational thumbnails for your channel.",
      },
    ],
  }),
  component: BrandKitPage,
});

function BrandKitPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-medium">Brand Kit</h1>
        <p className="text-sm text-muted-foreground">
          Define the look of your channel. We use it to generate thumbnails that
          feel like yours.
        </p>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-medium">Brand colors</h2>
          <p className="text-sm text-muted-foreground">
            Pick the colors that should show up in your thumbnails.
          </p>
        </div>
        <BrandColors />
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-medium">Inspirational thumbnails</h2>
          <p className="text-sm text-muted-foreground">
            Upload thumbnails whose style you want us to take inspiration from.
          </p>
        </div>

        <Suspense fallback={<InspirationalThumbnailsSkeleton />}>
          <InspirationalThumbnails />
        </Suspense>
      </section>
    </div>
  );
}
