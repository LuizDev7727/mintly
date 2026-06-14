import { Link, useParams } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronsUpDown, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getProjectsHttp } from "@/http/get-projects.http";

export function ProjectSwitcher() {
  const { slug, project: projectSlug } = useParams({ strict: false });

  const { data } = useSuspenseQuery({
    queryKey: ["projects", slug],
    queryFn: () => getProjectsHttp({ orgSlug: slug! }),
    enabled: !!slug,
  });

  const { projects } = data;

  const currentProject = projects.find(
    (project) => project.slug === projectSlug,
  );

  return (
    <div className="w-40 flex items-center justify-between gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer flex w-42 items-center gap-2 rounded p-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {currentProject ? (
            <span className="truncate text-left text-sm font-medium">
              {currentProject.name}
            </span>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              Select a project
            </span>
          )}
          <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-50">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Projects
          </DropdownMenuLabel>
          {projects.map(({ id, name, slug: projectSlug }) => (
            <DropdownMenuItem key={id} asChild>
              <Link
                to={"/orgs/$slug/projects/$project"}
                className="cursor-pointer"
                params={{ slug: slug, project: projectSlug }}
              >
                {name}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <button className="w-full cursor-pointer">
              <PlusCircle className="mr-2 size-4" />
              Create new
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
