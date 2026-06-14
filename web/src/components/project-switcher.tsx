import { Link, useParams } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronsUpDown, PlusCircle, Projector } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getProjectsHttp } from "@/http/get-projects.http";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

export function ProjectSwitcher() {
  const { isMobile } = useSidebar();
  const { slug, project: projectSlug } = useParams({
    from: "/orgs/$slug/projects/$project",
  });

  const { data } = useSuspenseQuery({
    queryKey: ["projects", slug],
    queryFn: () => getProjectsHttp({ orgSlug: slug }),
  });

  const { projects } = data;

  const currentProject = projects.find(
    (project) => project.slug === projectSlug,
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Projector className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentProject!.name}
                </span>
                <span className="truncate text-xs">
                  {currentProject!.postsCount} Posts
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Projects
            </DropdownMenuLabel>
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.name}
                className="gap-2 p-2 cursor-pointer"
                asChild
              >
                <Link
                  to={"/orgs/$slug/projects/$project"}
                  params={{ slug, project: project.slug }}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Projector className="size-3.5 shrink-0" />
                  </div>
                  {project.name}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2 cursor-pointer">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <PlusCircle className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Create project
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
