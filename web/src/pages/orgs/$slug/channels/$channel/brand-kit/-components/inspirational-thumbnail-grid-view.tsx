import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { InspirationalThumbnail } from "@/types/inspirational-thumbnail";
import { formatBytes } from "@/utils/format-bytes";

type InspirationalThumbnailGridViewProps = {
  thumbnails: InspirationalThumbnail[];
  selectedRows: string[];
  handleSelectRow: (id: string) => void;
  /** Tiles renderizados antes das thumbnails (dropzone, uploads em andamento). */
  children?: ReactNode;
};

export function InspirationalThumbnailGridView({
  thumbnails,
  selectedRows,
  handleSelectRow,
  children,
}: InspirationalThumbnailGridViewProps) {
  const isSelecting = selectedRows.length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}

      {thumbnails.map((thumbnail) => {
        const isSelected = selectedRows.includes(thumbnail.id);

        return (
          <div
            key={thumbnail.id}
            data-selected={isSelected}
            data-selecting={isSelecting}
            className="group relative rounded-lg border bg-card p-2.5 text-card-foreground transition-colors data-[selected=true]:border-primary"
          >
            <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
              <img
                alt={thumbnail.name}
                src={thumbnail.url}
                className="size-full object-cover"
              />
            </div>

            <div className="pt-2.5">
              <p className="line-clamp-1 text-sm font-semibold leading-snug">
                {thumbnail.name}
              </p>
              <p className="mt-0.75 text-[12.5px] text-muted-foreground">
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

            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleSelectRow(thumbnail.id)}
              aria-label={`Select ${thumbnail.name}`}
              className="absolute top-4 left-4 z-10 bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 group-data-[selecting=true]:opacity-100"
            />
          </div>
        );
      })}
    </div>
  );
}
