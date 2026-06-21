import { Button } from "@/components/ui/button";
import { formatBytes } from "@/utils/format-bytes";
import { Trash } from "lucide-react";

export function InspirationalThumbnailCard() {
  async function removeFile(fileId: string) {}

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="aspect-square shrink-0 rounded bg-accent">
          <img
            alt={"Como fazer amigos e influenciar pessoas"}
            className="size-10 rounded-[inherit] object-cover"
            src={"https://picsum.photos/seed/picsum/200/300"}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate font-medium text-[13px]">
            Como fazer amigos e influenciar pessoas
          </p>
          <p className="text-muted-foreground text-xs">
            {formatBytes(100_000)}
          </p>
        </div>
      </div>

      <Button
        aria-label="Remove file"
        className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
        onClick={() => removeFile("")}
        size="icon"
        variant="ghost"
      >
        <Trash aria-hidden="true" />
      </Button>
    </div>
  );
}
