import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  VideoGeneration,
  VideoGenerationStatus,
} from "@/types/video-generation";

const STATUS_LABEL = {
  queued: "Queued",
  generating: "Generating",
  complete: "Ready",
  error: "Failed",
} as const satisfies Record<VideoGenerationStatus, string>;

const STATUS_BADGE_VARIANT = {
  queued: "canceled",
  generating: "processing",
  complete: "default",
  error: "destructive",
} as const satisfies Record<VideoGenerationStatus, string>;

interface GenerationCardProps {
  generation: VideoGeneration;
}

export function GenerationCard({ generation }: GenerationCardProps) {
  return (
    <li className="flex items-center gap-4 p-4">
      <div className="min-w-0 flex-1 space-y-2">
        <p className="line-clamp-2 text-sm">{generation.prompt}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Badge variant={STATUS_BADGE_VARIANT[generation.status]}>
            {STATUS_LABEL[generation.status]}
          </Badge>
          <span className="font-mono">{generation.aspectRatio}</span>
          {generation.durationSeconds !== null && (
            <span className="font-mono">{generation.durationSeconds}s</span>
          )}
          <span>
            {formatDistanceToNow(new Date(generation.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove from history"
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}
