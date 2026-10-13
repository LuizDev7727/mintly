import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

type GenerationHistoryPaginationProps = {
  totalPages: number;
};

export function GenerationHistoryPagination({
  totalPages,
}: GenerationHistoryPaginationProps) {
  const [currentPage, setCurrentPage] = useQueryState(
    "generation_page",
    parseAsInteger.withDefault(0),
  );

  function goToFirstPage() {
    setCurrentPage(0);
  }

  function goToPreviousPage() {
    setCurrentPage(currentPage - 1);
  }

  function goToNextPage() {
    setCurrentPage(currentPage + 1);
  }

  function goToLastPage() {
    setCurrentPage(Math.max(totalPages - 1, 0));
  }

  const hasPreviousPage = currentPage > 0;
  const hasNextPage = currentPage < totalPages - 1;

  return (
    <div className="flex items-center justify-end gap-x-2 border-t p-3">
      <Button
        variant="outline"
        size="icon"
        aria-label="First page"
        onClick={goToFirstPage}
        disabled={!hasPreviousPage}
      >
        <ChevronsLeft className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous page"
        onClick={goToPreviousPage}
        disabled={!hasPreviousPage}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="px-1 text-xs tabular-nums text-muted-foreground">
        Page {currentPage + 1} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        aria-label="Next page"
        onClick={goToNextPage}
        disabled={!hasNextPage}
      >
        <ChevronRight className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label="Last page"
        onClick={goToLastPage}
        disabled={!hasNextPage}
      >
        <ChevronsRight className="size-4" />
      </Button>
    </div>
  );
}
