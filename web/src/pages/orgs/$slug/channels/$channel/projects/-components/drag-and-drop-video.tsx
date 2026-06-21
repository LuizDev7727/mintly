import { Button } from "@/components/ui/button";
import { Video, X } from "lucide-react";
import { useState } from "react";

interface DragAndDropVideoProps {
  onFileChange?: (file: File | null) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatType(file: File): string {
  return (
    file.type.split("/")[1]?.toUpperCase() ??
    file.name.split(".").pop()?.toUpperCase() ??
    "VIDEO"
  );
}

export function DragAndDropVideo({ onFileChange }: DragAndDropVideoProps) {
  const [file, setFile] = useState<File | null>(null);
  const maxSizeMB = 500;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    onFileChange?.(selected);
  }

  function handleDeselect() {
    setFile(null);
    onFileChange?.(null);
  }

  if (file) {
    return (
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-input p-6 gap-3 text-center">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full border bg-background">
          <Video className="size-4 opacity-60" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium line-clamp-2 leading-snug">
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatType(file)} · {formatSize(file.size)}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDeselect}>
          <X className="size-3.5" />
          Remove video
        </Button>
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-input border-dashed p-6 transition-colors hover:bg-accent/50 has-disabled:pointer-events-none has-[input:focus]:border-ring has-disabled:opacity-50 has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
      role="button"
      tabIndex={-1}
    >
      <input
        aria-label="Upload video"
        className="absolute inset-0 opacity-0 cursor-pointer"
        type="file"
        accept="video/*"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
        <div
          aria-hidden="true"
          className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
        >
          <Video className="size-4 opacity-60" />
        </div>
        <p className="mb-1.5 font-medium text-sm">
          Drop your video here or click to browse
        </p>
        <p className="text-muted-foreground text-xs">Max size: {maxSizeMB}MB</p>
      </div>
    </div>
  );
}
