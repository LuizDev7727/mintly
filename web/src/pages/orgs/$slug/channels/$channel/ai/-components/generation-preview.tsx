import { Video } from "lucide-react";
import type { VideoGeneration } from "@/types/video-generation";

const STATUS_TEXT = {
  queued: "Waiting in the queue…",
  generating: "Generating your video…",
  complete: "Your video is ready",
  error: "Generation failed",
} as const satisfies Record<VideoGeneration["status"], string>;

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

  return (
    <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-lg border bg-muted/30 p-6">
      <p
        data-status={generation.status}
        className="text-sm text-muted-foreground data-[status=error]:text-destructive"
      >
        {STATUS_TEXT[generation.status]}
      </p>
    </div>
  );
}
