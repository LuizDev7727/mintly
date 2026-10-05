import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

type BestMomentsPaginationProps = {
  totalPages: number;
};

export function BestMomentsPagination({
  totalPages,
}: BestMomentsPaginationProps) {
  const [currentPage, setCurrentPage] = useQueryState(
    "best_moments_page",
    parseAsInteger.withDefault(0),
  );

  const hasPreviousPage = currentPage > 0;
  const hasNextPage = currentPage < totalPages - 1;

  return (
    <div className="flex items-center gap-x-3">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={!hasPreviousPage}
      >
        <ChevronLeft className="size-4" />
        <span className="sr-only">Previous page</span>
      </Button>
      <span className="text-xs tabular-nums text-muted-foreground">
        Page {currentPage + 1} of {Math.max(totalPages, 1)}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={!hasNextPage}
      >
        <ChevronRight className="size-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
}
