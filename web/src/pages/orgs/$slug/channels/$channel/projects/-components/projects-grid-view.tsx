import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { dayjs } from "@/lib/dayjs";
import type { Project } from "@/types/project";
import { getInitials } from "@/utils/get-initials";
import { Link, useParams } from "@tanstack/react-router";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { STATUS_CONFIG, StatusBadge } from "./status-badge";

type ProjectsGridViewProps = {
  projects: Project[];
};

export function ProjectsGridView({ projects }: ProjectsGridViewProps) {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  return (
    <div className="flex flex-wrap gap-4">
      {projects.map((project) => {
        const config = STATUS_CONFIG[project.status];
        const isProcessing = project.status === "PROCESSING";

        return (
          <Link
            key={project.id}
            to="/orgs/$slug/channels/$channel/projects/$projectId"
            params={{ slug, channel, projectId: project.id }}
            className="group relative w-75 cursor-pointer overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md"
          >
            {isProcessing && (
              <div
                className={cn(
                  "absolute bottom-0 inset-x-0 h-0.5 animate-pulse z-10",
                  config.progressClassName,
                )}
              />
            )}
            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <img
                src={
                  project.thumbnailUrl ??
                  "https://picsum.photos/seed/NWbJM2B/640/480"
                }
                alt={project.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Status badge — top left */}
              <div className="absolute left-2.5 top-2.5">
                <StatusBadge status={project.status} />
              </div>

              {/* Clip count — bottom right */}
              {!isProcessing && (
                <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                  {project.clipCount} clips
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 flex-1 text-sm font-medium leading-snug">
                  {project.title}
                </h3>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(event) => event.stopPropagation()}
                      className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="size-4" />
                      Delete project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Creator + Date */}
              <div className="mt-2.5 flex items-center gap-2">
                <Avatar className="size-5">
                  {project.owner.avatarUrl && (
                    <AvatarImage
                      src={project.owner.avatarUrl}
                      alt={project.owner.name}
                    />
                  )}
                  <AvatarFallback className="text-[10px]">
                    {getInitials(project.owner.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {project.owner.name}
                </span>
                <span className="text-muted-foreground/40 text-xs">·</span>
                <span className="text-xs text-muted-foreground">
                  {dayjs(project.createdAt).format("MMM D, YYYY")}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
