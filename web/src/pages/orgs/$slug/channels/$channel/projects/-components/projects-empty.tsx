import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Clapperboard } from "lucide-react";

export function ProjectsEmpty() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Clapperboard />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Upload a video and let Mintly find the best moments for you
          automatically.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
