import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createFileRoute } from "@tanstack/react-router";
import { Clapperboard, Scissors, Search, X } from "lucide-react";
import { ProjectCard } from "./-components/project-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DragAndDropVideo } from "./-components/drag-and-drop-video";
import { ProjectsEmpty } from "./-components/projects-empty";

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

// Mostrar Criar uma UI dinamica na geração de projetos, onde ao usuário selecionar um video, ele é processado e exibido na página.
// Exemplo de Captions
function ChannelProjectsPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium">Projects</h1>
          <p className="text-muted-foreground text-sm">
            Generate best moments to your videos
          </p>
        </div>
        <Button>
          <Scissors className="size-4" />
          Generate Best Moments
        </Button>
      </header>

      <div className="flex items-stretch gap-x-4">
        <div className="space-y-4">
          <div className="w-160 rounded-md h-80 border border-input flex flex-col gap-y-2 items-center justify-center">
            <Clapperboard className="size-4" />
            <p className="text-muted-foreground text-sm">No video selected</p>
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="BRASIL e HAITI na COPA 2026 | VENCEU, MAS TE CONVENCEU ?"
              readOnly={true}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full">
          <div className="space-y-2">
            <Label>Youtube Link</Label>
            <Input placeholder="youtube.com/watch?v=" />
          </div>
          <Separator />
          <DragAndDropVideo />
        </div>
      </div>

      <Separator />

      <div className="*:not-first:mt-2">
        <div className="relative">
          <Input
            className="peer ps-9 pe-9"
            placeholder="Filter by name"
            type="search"
          />
          <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <Search size={16} />
          </div>
        </div>
      </div>

      {/*<div className="flex flex-wrap gap-4">
        <ProjectCard
          title="Neymar - All FIFA World Cup Goals and Assists"
          clipCount={10}
          status="DONE"
          createdAt={new Date(Date.now() - 1000 * 60 * 60 * 2)}
          createdBy={{ name: "Luiz Dev" }}
        />
        <ProjectCard
          title="Flow Podcast - Cortes imperdíveis do episódio #426"
          status="FINDING_BEST_MOMENTS"
          createdAt={new Date(Date.now() - 1000 * 60 * 5)}
          createdBy={{ name: "Maria Silva" }}
        />
        <ProjectCard
          title="IPCA + 9% - O melhor investimento?"
          status="GENERATING_METADATA"
          createdAt={new Date(Date.now() - 1000 * 60 * 1)}
          createdBy={{ name: "Carlos Mendes" }}
        />
        <ProjectCard
          title="Brasil vs Haiti - Copa 2026"
          status="DOWNLOADING"
          createdAt={new Date()}
          createdBy={{ name: "Luiz Dev" }}
        />
      </div>*/}

      <ProjectsEmpty />
    </div>
  );
}
