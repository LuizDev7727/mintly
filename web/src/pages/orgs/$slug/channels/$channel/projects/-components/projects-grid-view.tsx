import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dayjs } from "@/lib/dayjs";
import type { Project } from "@/types/project";
import { getInitials } from "@/utils/get-initials";
import { Link, useParams } from "@tanstack/react-router";
import { Eye, ImageIcon, MoreHorizontal, Trash2 } from "lucide-react";
import { ProjectStatusBadge } from "./projects-status-badge";

type ProjectsGridViewProps = {
  projects: Project[];
};

export function ProjectsGridView({ projects }: ProjectsGridViewProps) {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project) => {
        return (
          <div
            key={project.id}
            className="rounded-lg border border-border bg-sidebar p-2.5 text-card-foreground"
          >
            <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
              {
                project.thumbnailUrl !== null ?
                  <img src={project.thumbnailUrl} alt={project.title} className="h-full w-full object-cover" />
                  :
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageIcon size={28} />
                  </div>
              }

              <ProjectStatusBadge status={project.status} />

              {/* Clip count */}
              <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                {project.clipCount} clips
              </span>
            </div>

            {/* Linha inferior: avatar + texto + menu */}
            <div className="flex items-start gap-2.5 pt-2.5">
              <Avatar size="sm">
                {project.owner.avatarUrl && (
                  <AvatarImage
                    src={project.owner.avatarUrl}
                    alt={project.owner.name}
                  />
                )}
                <AvatarFallback>
                  {getInitials(project.owner.name)}
                </AvatarFallback>
              </Avatar>

              {/* Título + meta */}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold leading-snug text-card-foreground">
                  {project.title}
                </p>
                <div className="mt-0.75 flex flex-wrap items-center gap-1 text-[12.5px] text-muted-foreground">
                  <span>{project.owner.name}</span>
                  <span>•</span>
                  <span>{dayjs(project.createdAt).fromNow()}</span>
                </div>
              </div>

              {/* Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Button
                      type="button"
                      variant={"destructive"}
                    >
                      <Trash2 size={13} />
                      Delete project
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/orgs/$slug/channels/$channel/projects/$projectId"
                      params={{ slug, channel, projectId: project.id }}
                    >
                      <Eye className="size-4" />
                      View details
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
