import type { InspirationalThumbnail } from "@/types/inspirational-thumbnail";
import { formatBytes } from "@/utils/format-bytes";

type InspirationalThumbnailListViewProps = {
  thumbnails: InspirationalThumbnail[];
  selectedRows: string[];
  handleSelectRow: (id: string) => void;
};

export function InspirationalThumbnailListView({
  thumbnails,
  selectedRows,
  handleSelectRow,
}: InspirationalThumbnailListViewProps) {

  return (
    <div className="space-y-2">
      {thumbnails.map((thumbnail) => (
        <div data-is-selected={selectedRows.includes(thumbnail.id)} className="cursor-pointer flex bg-card items-center justify-between gap-2 rounded-lg border p-2 pe-3 data-[is-selected=true]:border-lime-400" onClick={() => handleSelectRow(thumbnail.id)}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="aspect-square shrink-0 rounded bg-accent">
              <img
                alt={thumbnail.name}
                className="size-10 rounded-[inherit] object-cover"
                src={thumbnail.url}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="truncate font-medium text-[13px]">
                {thumbnail.name}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatBytes(thumbnail.sizeInMs)}
              </p>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}
