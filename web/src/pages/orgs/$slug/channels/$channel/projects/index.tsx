import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Projects } from "./-components/projects";
import { Plus } from "lucide-react"
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
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium">Projects</h1>
          <p className="text-muted-foreground text-sm">
            Generate best moments to your videos
          </p>
        </div>
        <Button asChild>
          <Link
            to="/orgs/$slug/channels/$channel/projects/create-project"
            params={{
              slug,
              channel
            }}
          >
            <Plus/>
            Create Post
          </Link>
        </Button>
      </header>

      <ProjectsFilter />

      <Projects />
    </div>
  );
}
