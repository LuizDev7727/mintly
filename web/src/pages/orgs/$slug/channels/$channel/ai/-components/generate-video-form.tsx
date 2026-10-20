import { useEffect, useId, useMemo, useState } from "react";
import { Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { VideoGeneration } from "@/types/video-generation";

const MINUTE = 60_000;

const STATUS_TEXT = {
  queued: "Waiting in the queue…",
  generating: "Generating your video…",
  complete: "Your video is ready",
  error: "Generation failed",
} as const satisfies Record<VideoGeneration["status"], string>;

// Dado estático só para exibir o layout; ainda não há lógica de geração.
const SAMPLE_GENERATION: VideoGeneration = {
  id: "1",
  prompt:
    "A 30-second vertical video of a barista pouring latte art in slow motion, warm morning light.",
  status: "complete",
  createdAt: Date.now() - 4 * MINUTE,
  durationSeconds: 30,
};

export function GenerateVideoForm() {
  const inputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState("");

  const generation: VideoGeneration | undefined = SAMPLE_GENERATION;

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const hasFile = previewUrl !== null;

  return (
    <form className="space-y-3">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex h-96 shrink-0">
            <div className="relative size-full overflow-hidden rounded-lg border bg-card">
              {hasFile ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Selected example"
                    className="absolute inset-0 size-full bg-black object-contain"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    aria-label="Remove file"
                    className="absolute top-2 right-2"
                    onClick={() => setFile(null)}
                  >
                    <X />
                  </Button>
                </>
              ) : (
                <label
                  htmlFor={inputId}
                  className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground transition-colors hover:bg-accent/40"
                >
                  <Upload className="size-6" />
                  <span>Select an image to use as an example</span>
                  <span className="text-xs">PNG, JPG or WebP</span>
                </label>
              )}
              <input
                id={inputId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="video-instructions">Instructions</Label>
            <Textarea
              id="video-instructions"
              rows={2}
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Describe how the video should be generated…"
              className="resize-none bg-card p-3"
            />
          </div>
        </div>

        {generation ? (
          <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-lg border bg-muted/30 p-6">
            <p
              data-status={generation.status}
              className="text-sm text-muted-foreground data-[status=error]:text-destructive"
            >
              {STATUS_TEXT[generation.status]}
            </p>
          </div>
        ) : (
          <div className="flex h-full min-h-80 flex-col items-center justify-center gap-2 rounded-lg border bg-muted/30 p-6 text-center text-muted-foreground">
            <Video className="size-6" />
            <p className="text-sm">Your generated video will appear here.</p>
          </div>
        )}
      </div>

      <Button type="button" disabled={!hasFile}>
        Generate Video
      </Button>
    </form>
  );
}
