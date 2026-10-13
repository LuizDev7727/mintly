import { AlertCircle, Loader2, Play, Video } from "lucide-react";
import type { VideoGeneration } from "@/types/video-generation";

const STATUS_TEXT = {
  queued: "Waiting in the queue…",
  generating: "Generating your video…",
  complete: "Your video is ready",
  error: "Generation failed",
} as const satisfies Record<VideoGeneration["status"], string>;

const ASPECT_RATIO_CSS = {
  "9:16": "9 / 16",
  "16:9": "16 / 9",
  "1:1": "1 / 1",
} as const satisfies Record<VideoGeneration["aspectRatio"], string>;

interface GenerationPreviewProps {
  generation: VideoGeneration | undefined;
}

export function GenerationPreview({ generation }: GenerationPreviewProps) {
  if (!generation) {
    return (
      <div className="flex h-full min-h-80 flex-col items-center justify-center gap-2 rounded-lg border bg-muted/30 p-6 text-center text-muted-foreground">
        <Video className="size-6" />
        <p className="text-sm">Your generated video will appear here.</p>
      </div>
    );
  }

  const isInProgress =
    generation.status === "queued" || generation.status === "generating";

  return (
    <div className="flex h-full min-h-80 flex-col items-center justify-center gap-4 rounded-lg border bg-muted/30 p-6">
      <div
        data-status={generation.status}
        style={{ aspectRatio: ASPECT_RATIO_CSS[generation.aspectRatio] }}
        className="flex max-h-[28rem] w-full max-w-sm items-center justify-center rounded-md border bg-linear-to-br from-primary/20 via-muted to-muted text-muted-foreground data-[status=error]:from-destructive/20 data-[status=error]:text-destructive"
      >
        {isInProgress && <Loader2 className="size-8 animate-spin" />}
        {generation.status === "complete" && <Play className="size-8" />}
        {generation.status === "error" && <AlertCircle className="size-8" />}
      </div>
      <p className="text-sm text-muted-foreground">
        {STATUS_TEXT[generation.status]}
      </p>
    </div>
  );
}
