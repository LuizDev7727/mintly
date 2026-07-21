import { Badge } from "@/components/ui/badge";
import type { Post } from "@/types/post";
import { AlertTriangle, Ban, Calendar, Check, Loader2 } from "lucide-react";

type PostStatusBadgeProps = {
  status: Post["status"];
};

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
  switch (status) {
    case "PUBLISHED":
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
    case "SCHEDULED":
      return (
        <Badge variant={"scheduled"}>
          <Calendar size={13} />
          {status}
        </Badge>
      );
    case "CANCELED":
      return (
        <Badge variant={"secondary"}>
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
