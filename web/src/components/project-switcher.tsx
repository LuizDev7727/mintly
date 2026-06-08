import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronsUpDown, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getProjectsHttp } from "@/http/get-projects.http";

type ProjectSwitcherProps = {
  orgSlug: string;
};

export function ProjectSwitcher({ orgSlug }: ProjectSwitcherProps) {
  const { data } = useSuspenseQuery({
    queryKey: ["projects", orgSlug],
    queryFn: () => getProjectsHttp({ orgSlug }),
  });

  const { projects } = data;

  const currentProject = projects[0] ?? null;

  function handleSetSelectedProject(projectSlug: string) {
    console.log({ projectSlug });
  }

  if (!currentProject) return null;

  return (
    <div className="w-40 flex items-center justify-between gap-1">
      <Link to={`/`} className="w-full hover:underline">
        <span className="truncate text-left text-sm font-medium">
          {currentProject.name}
        </span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer">
          <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-50">
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => handleSetSelectedProject(project.slug)}
            >
              {project.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <button className="w-full">
              <PlusCircle className="mr-2 size-4" />
              Create new
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
