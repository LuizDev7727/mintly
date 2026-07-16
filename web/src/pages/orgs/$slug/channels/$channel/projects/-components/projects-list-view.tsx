import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Project } from "@/types/project";
import { StatusBadge } from "./status-badge";
import { getInitials } from "@/utils/get-initials";
import { dayjs } from "@/lib/dayjs";
import { Link, useParams } from "@tanstack/react-router";

type ProjectsListViewProps = {
  projects: Project[];
};

export function ProjectsListView({ projects }: ProjectsListViewProps) {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        return (
          <Link
            key={project.id}
            to="/orgs/$slug/channels/$channel/projects/$projectId"
            params={{ slug, channel, projectId: project.id }}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-card p-2 pe-3 transition-colors hover:bg-accent/50"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="aspect-video h-12 shrink-0 overflow-hidden rounded bg-muted">
                {project.thumbnailUrl && (
                  <img
                    alt={project.title}
                    className="size-full object-cover"
                    src={project.thumbnailUrl}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {project.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {project.clipCount} clips
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <StatusBadge status={project.status} />

              <Avatar className="size-6">
                <AvatarImage
                  src={project.owner.avatarUrl ?? undefined}
                  alt={project.owner.name}
                />
                <AvatarFallback className="text-[10px]">
                  {getInitials(project.owner.name)}
                </AvatarFallback>
              </Avatar>

              <span className="text-xs text-muted-foreground">
                {dayjs(project.createdAt).fromNow()}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
