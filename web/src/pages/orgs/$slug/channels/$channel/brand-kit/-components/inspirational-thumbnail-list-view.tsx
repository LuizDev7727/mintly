import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { InspirationalThumbnail } from "@/types/inspirational-thumbnail";
import { formatBytes } from "@/utils/format-bytes";

type InspirationalThumbnailListViewProps = {
  thumbnails: InspirationalThumbnail[];
  selectedRows: string[];
  handleSelectRow: (id: string) => void;
  /** Linhas renderizadas antes das thumbnails (dropzone, uploads em andamento). */
  children?: ReactNode;
};

export function InspirationalThumbnailListView({
  thumbnails,
  selectedRows,
  handleSelectRow,
  children,
}: InspirationalThumbnailListViewProps) {
  return (
    <div className="space-y-2">
      {children}

      {thumbnails.map((thumbnail) => {
        const isSelected = selectedRows.includes(thumbnail.id);

        return (
          <div
            key={thumbnail.id}
            data-selected={isSelected}
            className="relative flex items-center gap-3 rounded-lg border bg-card p-2 pe-3 transition-colors hover:bg-muted/50 data-[selected=true]:border-primary"
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleSelectRow(thumbnail.id)}
              aria-label={`Select ${thumbnail.name}`}
              className="z-10 ms-1"
            />

            <div className="aspect-video h-12 shrink-0 overflow-hidden rounded bg-muted">
              <img
                alt={thumbnail.name}
                src={thumbnail.url}
                className="size-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{thumbnail.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {formatBytes(thumbnail.sizeInBytes)}
              </p>
            </div>

            <button
              type="button"
              aria-label={`Select ${thumbnail.name}`}
              aria-pressed={isSelected}
              onClick={() => handleSelectRow(thumbnail.id)}
              className="absolute inset-0 cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        );
      })}
    </div>
  );
}
