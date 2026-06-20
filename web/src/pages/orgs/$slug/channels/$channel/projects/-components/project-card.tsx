import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Download, Loader2, MoreHorizontal, Scissors, Sparkles, Trash2 } from "lucide-react";

type ProjectStatus =
  | "GENERATING_METADATA"
  | "DOWNLOADING"
  | "FINDING_BEST_MOMENTS"
  | "DONE";

interface ProjectCardProps {
  title: string;
  thumbnailUrl?: string;
  clipCount?: number;
  createdAt: Date;
  status: ProjectStatus;
  createdBy: {
    name: string;
    avatarUrl?: string;
  };
}

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  DOWNLOADING: {
    label: "Downloading",
    icon: Download,
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  GENERATING_METADATA: {
    label: "Processing",
    icon: Sparkles,
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  FINDING_BEST_MOMENTS: {
    label: "Finding moments",
    icon: Scissors,
    className: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  },
  DONE: {
    label: "Done",
    icon: Sparkles,
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
};

const PROCESSING_STATUSES: ProjectStatus[] = [
  "DOWNLOADING",
  "GENERATING_METADATA",
  "FINDING_BEST_MOMENTS",
];

function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const isProcessing = PROCESSING_STATUSES.includes(status);

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

export function ProjectCard({
  title = "Neymar - All FIFA World Cup Goals and Assists",
  thumbnailUrl = "https://picsum.photos/seed/NWbJM2B/640/480",
  clipCount = 10,
  createdAt = new Date(),
  status = "DONE",
  createdBy = { name: "Luiz Dev", avatarUrl: undefined },
}: Partial<ProjectCardProps>) {
  const isProcessing = PROCESSING_STATUSES.includes(status);
  const initials = createdBy.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="group relative w-[300px] cursor-pointer overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img
          src={thumbnailUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Status badge — top left */}
        <div className="absolute left-2.5 top-2.5">
          <StatusBadge status={status} />
        </div>

        {/* Clip count — bottom right */}
        {!isProcessing && clipCount !== undefined && (
          <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {clipCount} clips
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 text-sm font-medium leading-snug">
            {title}
          </h3>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100">
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
            <AvatarImage src={createdBy.avatarUrl} alt={createdBy.name} />
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{createdBy.name}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
