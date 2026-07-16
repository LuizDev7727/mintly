import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { BestMomentsLoading } from "./-components/best-moments-loading";
import { BestMoments } from "./-components/best-moments";

export const Route = createFileRoute(
  "/orgs/$slug/channels/$channel/projects/$projectId/",
)({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Browse and download the best moments generated for this project",
      },
      { title: "Best Moments | Mintly" },
    ],
  }),
  component: ProjectBestMomentsPage,
});

function ProjectBestMomentsPage() {
  const { slug, channel } = Route.useParams();

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ms-2">
          <Link
            to="/orgs/$slug/channels/$channel/projects"
            params={{ slug, channel }}
          >
            <ArrowLeft className="size-4" />
            Back to projects
          </Link>
        </Button>

        <div>
          <h1 className="text-xl font-medium">Best Moments</h1>
          <p className="text-muted-foreground text-sm">
            AI-generated clips ready to download and share
          </p>
        </div>
      </header>

      <Separator />

      <Suspense fallback={<BestMomentsLoading />}>
        <BestMoments />
      </Suspense>
    </div>
  );
}
