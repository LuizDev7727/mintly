import { Video } from "lucide-react";

export function DragAndDropVideo() {
  const maxSizeMB = 500;
  const maxSize = maxSizeMB * 1024 * 1024;

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="relative flex-1">
        {/* Drop area */}
        <div
          className="h-full cursor-pointer relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-input border-dashed p-4 transition-colors hover:bg-accent/50 has-disabled:pointer-events-none has-[input:focus]:border-ring has-[img]:border-none has-disabled:opacity-50 has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
          role="button"
          tabIndex={-1}
        >
          <input aria-label="Upload video" className="sr-only" />
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
            <p className="text-muted-foreground text-xs">
              Max size: {maxSizeMB}MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
