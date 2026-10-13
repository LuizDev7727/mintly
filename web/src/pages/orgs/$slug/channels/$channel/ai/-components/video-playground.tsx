import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { VideoGeneration } from "@/types/video-generation";
import { GenerationHistory } from "./generation-history";
import { GenerationPreview } from "./generation-preview";

const ASPECT_RATIOS = ["9:16", "16:9", "1:1"];

const MINUTE = 60_000;

// Dados estáticos só para exibir o layout; ainda não há lógica de geração.
const SAMPLE_GENERATIONS: VideoGeneration[] = [
  {
    id: "1",
    prompt:
      "A 30-second vertical video of a barista pouring latte art in slow motion, warm morning light.",
    aspectRatio: "9:16",
    status: "complete",
    createdAt: Date.now() - 4 * MINUTE,
    durationSeconds: 30,
  },
  {
    id: "2",
    prompt: "A time-lapse of a city skyline from day to night, cinematic.",
    aspectRatio: "16:9",
    status: "complete",
    createdAt: Date.now() - 52 * MINUTE,
    durationSeconds: 12,
  },
  {
    id: "3",
    prompt: "Product showcase of a pair of sneakers rotating on a pedestal.",
    aspectRatio: "1:1",
    status: "error",
    createdAt: Date.now() - 3 * 60 * MINUTE,
    durationSeconds: null,
  },
  ...Array.from({ length: 9 }, (_, index): VideoGeneration => ({
    id: `sample-${index + 4}`,
    prompt: `Sample generation #${index + 4}: a short clip with smooth camera movement and soft lighting.`,
    aspectRatio: ASPECT_RATIOS[index % ASPECT_RATIOS.length] as VideoGeneration["aspectRatio"],
    status: "complete",
    createdAt: Date.now() - (index + 4) * 60 * MINUTE,
    durationSeconds: 10 + index,
  })),
];

export function VideoPlayground() {
  return (
    <div className="space-y-6">
      <GenerationPreview generation={SAMPLE_GENERATIONS[0]} />

      <form className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="video-prompt" className="sr-only">
            Prompt
          </Label>
          <Textarea
            id="video-prompt"
            rows={5}
            placeholder="A 30-second vertical video of a barista pouring latte art in slow motion, warm morning light…"
            className="resize-none bg-card p-3"
          />
          <div className="flex justify-end">
            <span className="font-mono text-xs text-muted-foreground">
              0/500
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button type="button">Submit</Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Reset"
            >
              <RotateCcw />
            </Button>
          </div>

          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            defaultValue="9:16"
          >
            {ASPECT_RATIOS.map((ratio) => (
              <ToggleGroupItem key={ratio} value={ratio} className="font-mono">
                {ratio}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </form>

      <GenerationHistory generations={SAMPLE_GENERATIONS} />
    </div>
  );
}
