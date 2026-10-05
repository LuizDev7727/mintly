import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Projects } from "./-components/projects";
import { Plus } from "lucide-react"
import { Separator } from "@/components/ui/separator";
import { ProjectsFilter } from "./-components/projects-filter";

export const Route = createFileRoute("/orgs/$slug/channels/$channel/projects/")(
  {
    head: () => ({
      meta: [
        {
          name: "description",
          content: "Create shorts/reels with AI-powered best moment generation",
        },
        { title: "Projects | Mintly" },
      ],
    }),
    component: ChannelProjectsPage,
  },
);

function ChannelProjectsPage() {

  const { slug, channel } = Route.useParams()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <div className="flex items-center gap-x-2">
            <Button asChild>
              <Link
                to="/orgs/$slug/channels/$channel/projects/create-project"
                params={{
                  slug,
                  channel
                }}
              >
                <Plus/>
                Create Project
              </Link>
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Generate best moments to your videos
        </p>
      </header>

      <div className="flex items-center justify-between gap-2">
        <ProjectsFilter />
      </div>

      <Separator />

      <div className="flex flex-1 flex-col">
        <Projects />
      </div>
    </div>
  );
}
