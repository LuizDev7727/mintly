import { Video } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function VideosEmpty() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Video />
        </EmptyMedia>
        <EmptyTitle>No videos yet</EmptyTitle>
        <EmptyDescription>
          The videos you generate with AI will show up here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
