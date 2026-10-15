import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { VideoGeneration } from "@/types/video-generation";
import { GenerationHistory } from "./generation-history";
import { GenerationPreview } from "./generation-preview";
import { ImageFileInput } from "./image-file-input";

const MINUTE = 60_000;

// Dados estáticos só para exibir o layout; ainda não há lógica de geração.
const SAMPLE_GENERATIONS: VideoGeneration[] = [
  {
    id: "1",
    prompt:
      "A 30-second vertical video of a barista pouring latte art in slow motion, warm morning light.",
    status: "complete",
    createdAt: Date.now() - 4 * MINUTE,
    durationSeconds: 30,
  },
  {
    id: "2",
    prompt: "A time-lapse of a city skyline from day to night, cinematic.",
    status: "complete",
    createdAt: Date.now() - 52 * MINUTE,
    durationSeconds: 12,
  },
  {
    id: "3",
    prompt: "Product showcase of a pair of sneakers rotating on a pedestal.",
    status: "error",
    createdAt: Date.now() - 3 * 60 * MINUTE,
    durationSeconds: null,
  },
  ...Array.from({ length: 9 }, (_, index): VideoGeneration => ({
    id: `sample-${index + 4}`,
    prompt: `Sample generation #${index + 4}: a short clip with smooth camera movement and soft lighting.`,
    status: "complete",
    createdAt: Date.now() - (index + 4) * 60 * MINUTE,
    durationSeconds: 10 + index,
  })),
];

export function VideoPlayground() {
  const [file, setFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState("");

  const hasFile = file !== null;

  return (
    <div className="space-y-6">
      <form className="space-y-3">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="flex min-h-96 flex-1">
              <ImageFileInput file={file} onChange={setFile} />
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

          <GenerationPreview generation={SAMPLE_GENERATIONS[0]} />
        </div>

        <Button type="button" disabled={!hasFile}>
          Generate Video
        </Button>
      </form>

      <GenerationHistory generations={SAMPLE_GENERATIONS} />
    </div>
  );
}
