import type { InspirationalThumbnail } from "@/types/inspirational-thumbnail";
import { FileImage } from "lucide-react";
import { formatBytes } from "@/utils/format-bytes";
import { Separator } from "@/components/ui/separator";

type InspirationalThumbnailGridViewProps = {
  thumbnails: InspirationalThumbnail[];
  selectedRows: string[];
  handleSelectRow: (id: string) => void;
};

export function InspirationalThumbnailGridView({
  thumbnails,
  selectedRows,
  handleSelectRow,
}: InspirationalThumbnailGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {thumbnails.map((thumbnail) => (
        <div data-is-selected={selectedRows.includes(thumbnail.id)} className="flex flex-col overflow-hidden rounded-xl border bg-card cursor-pointer data-[is-selected=true]:border-lime-400" onClick={() => handleSelectRow(thumbnail.id)}>
          <div className="flex items-center gap-2 p-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary">
              <FileImage className="size-4 text-primary-foreground" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {thumbnail.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {formatBytes(thumbnail.sizeInMs)}
              </p>
            </div>

            {/*<DeleteInspirationalThumbnailDropdown id={thumbnail.id} />*/}
          </div>

          <Separator />

          <div className="h-40 bg-muted/40 p-3">
            <div className="size-full overflow-hidden rounded-md bg-background">
              <img
                alt={thumbnail.name}
                className="size-full object-cover"
                src={thumbnail.url}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
