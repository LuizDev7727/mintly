import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getProjectHttp } from "@/http/projects/get-project.http";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import axios from "axios";
import { ArrowLeft, CloudUpload } from "lucide-react";
import { Suspense } from "react";
import { BestMomentsLoading } from "./-components/best-moments-loading";
import { BestMoments } from "./-components/best-moments";
import { ProjectNotFound } from "./-components/project-not-found";

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
  loader: async ({ params }) => {
    try {
      const project = await getProjectHttp({ projectId: params.projectId });
      return { project };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw notFound();
      }

      throw error;
    }
  },
  notFoundComponent: ProjectNotFound,
  component: ProjectBestMomentsPage,
});

function ProjectBestMomentsPage() {
  const { slug, channel } = Route.useParams();
  const { project } = Route.useLoaderData();

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
          <h1 className="text-xl font-medium">{project.title}</h1>
          <div className="space-y-2">
            <div className="flex items-center gap-x-2">
              <p className="text-muted-foreground">{project.owner.name}</p>
              <div className="bg-border w-2 rotate-90 h-px" />
              <p className="text-muted-foreground text-sm">{project.bestMomentsCount} best moments</p>
            </div>
          </div>
        </div>
      </header>

      <Separator />

      <Suspense fallback={<BestMomentsLoading />}>
        <BestMoments />
      </Suspense>
    </div>
  );
}
