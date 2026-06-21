import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Clapperboard } from "lucide-react";
import { useQueryState } from "nuqs";

export function ProjectsEmpty() {
  const [titleFilter] = useQueryState("title_filter", { defaultValue: "" });

  const hasSearch = titleFilter.length > 0;

  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Clapperboard />
        </EmptyMedia>
        {hasSearch && <EmptyTitle>No projects match your search</EmptyTitle>}
        {!hasSearch && <EmptyTitle>No projects yet</EmptyTitle>}
        {hasSearch && (
          <EmptyDescription>
            Try adjusting your filters or search term.
          </EmptyDescription>
        )}
        {!hasSearch && (
          <EmptyDescription>
            Upload a video and let Mintly find the best moments for you
            automatically.
          </EmptyDescription>
        )}
      </EmptyHeader>
    </Empty>
  );
}
