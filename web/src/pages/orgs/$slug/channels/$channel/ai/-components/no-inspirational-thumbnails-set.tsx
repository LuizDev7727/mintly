import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { FileImage } from "lucide-react";
import { AddInspirationalThumbnailSheet } from "./add-inspirational-thumbnail-sheet";

export function NoInspirationalThumbnailsSet() {
  return (
    <Empty className="border border-dashed h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileImage />
        </EmptyMedia>
        <EmptyTitle>No Inspirational Thumbnails Set</EmptyTitle>
        <EmptyDescription>
          Upload files to set your inspirational thumbnails.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <AddInspirationalThumbnailSheet />
      </EmptyContent>
    </Empty>
  );
}
