import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CreateProjectForm } from "./-components/create-project-form";
import { ProjectsFilter } from "./-components/projects-filter";
import { Projects } from "./-components/projects";

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
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-medium">Projects</h1>
        <p className="text-muted-foreground text-sm">
          Generate best moments to your videos
        </p>
      </header>

      <CreateProjectForm />

      <Separator />

      <div className="flex items-center gap-x-2">
        <ProjectsFilter />

        <div className="flex items-cente gap-x-2">
          <Button variant="ghost">
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button variant="ghost" disabled={true}>
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Projects />
    </div>
  );
}
