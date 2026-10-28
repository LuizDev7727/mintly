import { Plus } from "lucide-react";

interface ThumbnailDropzoneProps {
  variant: "tile" | "row";
  onBrowse: () => void;
}

export function ThumbnailDropzone({
  variant,
  onBrowse,
}: ThumbnailDropzoneProps) {
  return (
    <button
      type="button"
      data-variant={variant}
      onClick={onBrowse}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[variant=row]:h-16 data-[variant=tile]:min-h-32 data-[variant=tile]:flex-col"
    >
      <Plus className="size-5" />
      <span>Add thumbnails</span>
      {variant === "tile" && (
        <span className="text-xs">or drop them anywhere</span>
      )}
    </button>
  );
}
