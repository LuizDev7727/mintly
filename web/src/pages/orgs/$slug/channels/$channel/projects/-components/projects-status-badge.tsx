import { Badge, type badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";
import type { VariantProps } from "class-variance-authority";
import {
  Ban,
  Clock,
  Loader2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

export type ProjectStatus = Project["status"];

export const STATUS_CONFIG: Record<
  ProjectStatus,
  {
    label: string;
    icon: React.ElementType;
    variant: NonNullable<VariantProps<typeof badgeVariants>["variant"]>;
  }
> = {
  PROCESSING: {
    label: "Processing",
    icon: Loader2,
    variant: "processing",
  },
  SCHEDULED: {
    label: "Scheduled",
    icon: Clock,
    variant: "scheduled",
  },
  ERROR: {
    label: "Error",
    icon: TriangleAlert,
    variant: "destructive",
  },
  CANCELED: {
    label: "Canceled",
    icon: Ban,
    variant: "canceled",
  },
  SUCCESS: {
    label: "Done",
    icon: Sparkles,
    variant: "success",
  },
};

export function ProjectsStatusBadge({ status }: { status: ProjectStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      <Icon className={cn(status === "PROCESSING" && "animate-spin")} />
      {config.label}
    </Badge>
  );
}
