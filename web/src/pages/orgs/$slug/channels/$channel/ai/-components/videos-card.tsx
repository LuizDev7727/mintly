import { formatDistanceToNow } from "date-fns";
import { Video as VideoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Video } from "@/types/video";

const STATUS_LABEL = {
  READY: "Ready",
  GENERATING: "Generating",
  FAILED: "Failed",
} as const satisfies Record<Video["status"], string>;

const STATUS_BADGE_VARIANT = {
  READY: "default",
  GENERATING: "processing",
  FAILED: "destructive",
} as const satisfies Record<Video["status"], string>;

interface VideosCardProps {
  video: Video;
}

export function VideosCard({ video }: VideosCardProps) {
  return (
    <li className="flex items-center gap-4 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <VideoIcon className="size-5" />
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="truncate text-sm font-medium">
          {video.filename ?? "Generating video…"}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Badge variant={STATUS_BADGE_VARIANT[video.status]}>
            {STATUS_LABEL[video.status]}
          </Badge>
          <span>
            {formatDistanceToNow(new Date(video.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </li>
  );
}
