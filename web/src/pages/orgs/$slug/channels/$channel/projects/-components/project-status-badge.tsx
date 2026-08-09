import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types/project";
import { AlertTriangle, Ban, Calendar, Check, Loader2 } from "lucide-react";

type ProjectStatusBadgeProps = {
  status: Project["status"];
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  switch (status) {
    case "SUCCESS":
      return (
        <Badge className="absolute left-2 top-2 inline-flex items-center gap-1">
          <Check size={13} />
          {status}
        </Badge>
      );
    case "ERROR":
      return (
        <Badge variant={"destructive"} className="absolute left-2 top-2 inline-flex items-center gap-1">
          <AlertTriangle size={13} />
          {status}
        </Badge>
      );
    case "SCHEDULED":
      return (
        <Badge variant={"scheduled"} className="absolute left-2 top-2 inline-flex items-center gap-1">
          <Calendar size={13} />
          {status}
        </Badge>
      );
    case "CANCELED":
      return (
        <Badge variant={"secondary"} className="absolute left-2 top-2 inline-flex items-center gap-1">
          <Ban size={13} />
          {status}
        </Badge>
      );
    default:
      return (
        <Badge className="absolute left-2 top-2 inline-flex items-center gap-1">
          <Loader2 size={13} className="animate-spin" />
          {status}
        </Badge>
      );
  }
}
