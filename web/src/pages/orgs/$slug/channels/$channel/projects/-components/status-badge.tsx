import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";
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
    className: string;
    progressClassName: string;
  }
> = {
  PROCESSING: {
    label: "Processing",
    icon: Loader2,
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    progressClassName: "bg-amber-400",
  },
  SCHEDULED: {
    label: "Scheduled",
    icon: Clock,
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    progressClassName: "bg-blue-400",
  },
  ERROR: {
    label: "Error",
    icon: TriangleAlert,
    className: "bg-red-500/20 text-red-400 border-red-500/30",
    progressClassName: "",
  },
  CANCELED: {
    label: "Canceled",
    icon: Ban,
    className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    progressClassName: "",
  },
  SUCCESS: {
    label: "Done",
    icon: Sparkles,
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    progressClassName: "",
  },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const isProcessing = status === "PROCESSING";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-sm",
        config.className,
      )}
    >
      {isProcessing ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <Icon className="size-3" />
      )}
      {config.label}
    </span>
  );
}
