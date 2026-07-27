import { Separator } from "@/components/ui/separator";
import { createFileRoute } from "@tanstack/react-router";
import { CreateProjectForm } from "./-components/create-project-form";
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

      <Projects />
    </div>
  );
}
