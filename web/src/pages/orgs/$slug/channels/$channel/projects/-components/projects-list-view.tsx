import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Project } from "@/types/project";
import { getInitials } from "@/utils/get-initials";
import { dayjs } from "@/lib/dayjs";
import { Link, useParams } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, Calendar, Ban, Loader2 } from "lucide-react";

type ProjectsListViewProps = {
  projects: Project[];
};

type ProjectStatusBadgeProps = {
  status: Project["status"];
};

export function ProjectsListView({ projects }: ProjectsListViewProps) {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge>
            <Check size={13} />
            {status}
          </Badge>
        );
      case "ERROR":
        return (
          <Badge variant={"destructive"}>
            <AlertTriangle size={13} />
            {status}
          </Badge>
        );
      case "ENCODING":
        return (
          <Badge variant={"scheduled"}>
            <Calendar size={13} />
            {status}
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge variant={"outline"}>
            <Ban size={13} />
            {status}
          </Badge>
        );
      default:
        return (
          <Badge>
            <Loader2 size={13} className="animate-spin" />
            {status}
          </Badge>
        );
    }
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        return (
          <Link
            key={project.id}
            to="/orgs/$slug/channels/$channel/projects/$projectId"
            params={{ slug, channel, projectId: project.id }}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-card p-2 pe-3 transition-colors"
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
                  {project.clipCount} clips {" · "}
                  {dayjs(project.createdAt).fromNow()}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <ProjectStatusBadge status={project.status} />

              <Avatar className="size-6">
                {
                  project.owner.avatarUrl && (
                    <AvatarImage
                      src={project.owner.avatarUrl}
                      alt={project.owner.name}
                    />
                  )
                }
                <AvatarFallback className="text-[10px]">
                  {getInitials(project.owner.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
