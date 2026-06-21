import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Scissors } from "lucide-react";
import { useState } from "react";
import { DragAndDropVideo } from "./-components/drag-and-drop-video";
import { ProjectsEmpty } from "./-components/projects-empty";
import { ProjectsFilter } from "./-components/projects-filter";
import { ProjectCard } from "./-components/project-card";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const projects: never[] = [];

  const isPostsEmpty = projects.length === 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-medium">Projects</h1>
        <p className="text-muted-foreground text-sm">
          Generate best moments to your videos
        </p>
      </header>

      <div className="flex flex-col gap-4 w-full">
        <DragAndDropVideo onFileChange={setSelectedFile} />
        <Button disabled={!selectedFile}>
          <Scissors className="size-4" />
          Generate Best Moments
        </Button>
      </div>

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

      {isPostsEmpty ? (
        <ProjectsEmpty />
      ) : (
        <div className="flex flex-wrap gap-4">
          <ProjectCard
            title="Neymar - All FIFA World Cup Goals and Assists"
            clipCount={10}
            status="DONE"
            createdAt={new Date()}
            createdBy={{ name: "Luiz Dev" }}
          />
          <ProjectCard
            title="Flow Podcast - Cortes imperdíveis do episódio #426"
            status="FINDING_BEST_MOMENTS"
            createdAt={new Date()}
            createdBy={{ name: "Maria Silva" }}
          />
          <ProjectCard
            title="IPCA + 9% - O melhor investimento?"
            status="GENERATING_METADATA"
            createdAt={new Date()}
            createdBy={{ name: "Carlos Mendes" }}
          />
          <ProjectCard
            title="Brasil vs Haiti - Copa 2026"
            status="DOWNLOADING"
            createdAt={new Date()}
            createdBy={{ name: "Luiz Dev" }}
          />
        </div>
      )}
    </div>
  );
}
