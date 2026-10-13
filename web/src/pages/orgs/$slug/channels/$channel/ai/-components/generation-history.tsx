import { History } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { VideoGeneration } from "@/types/video-generation";
import { GenerationCard } from "./generation-card";
import { GenerationHistoryPagination } from "./generation-history-pagination";

interface GenerationHistoryProps {
  generations: VideoGeneration[];
}

const PAGE_SIZE = 5;

export function GenerationHistory({ generations }: GenerationHistoryProps) {
  const [currentPage] = useQueryState(
    "generation_page",
    parseAsInteger.withDefault(0),
  );

  const hasGenerations = generations.length > 0;
  const totalPages = Math.max(Math.ceil(generations.length / PAGE_SIZE), 1);
  const safePage = Math.min(Math.max(currentPage, 0), totalPages - 1);
  const pageGenerations = generations.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );
  const hasPagination = totalPages > 1;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 p-4">
        <div>
          <h2 className="text-sm font-medium">History</h2>
          <p className="text-xs text-muted-foreground">
            {hasGenerations
              ? `${generations.length} ${generations.length === 1 ? "generation" : "generations"} · newest first`
              : "What you generate will show up here."}
          </p>
        </div>
        {hasGenerations && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            Clear history
          </Button>
        )}
      </div>

      {hasGenerations ? (
        <ul className="divide-y border-t">
          {pageGenerations.map((generation) => (
            <GenerationCard key={generation.id} generation={generation} />
          ))}
        </ul>
      ) : (
        <Empty className="border-t">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History />
            </EmptyMedia>
            <EmptyTitle>No generations yet</EmptyTitle>
            <EmptyDescription>
              Describe a video above and hit Generate to get started.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {hasPagination && <GenerationHistoryPagination totalPages={totalPages} />}
    </section>
  );
}
