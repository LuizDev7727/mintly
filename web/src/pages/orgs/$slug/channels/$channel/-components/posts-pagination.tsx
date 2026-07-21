import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

type PostsPaginationProps = {
  totalPages: number;
};

export function PostsPagination({ totalPages }: PostsPaginationProps) {
  const [currentPage, setCurrentPage] = useQueryState(
    "post_page",
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
  const isFirstPage = currentPage === 0;

  return (
    <div className="flex items-center gap-x-2">
      <Button
        variant={"outline"}
        size={"icon"}
        onClick={goToFirstPage}
        disabled={!hasPreviousPage || isFirstPage}
      >
        <ChevronsLeft className="size-4" />
      </Button>
      <Button
        variant={"outline"}
        size={"icon"}
        onClick={goToPreviousPage}
        disabled={!hasPreviousPage || isFirstPage}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="text-xs text-muted-foreground px-1 tabular-nums">
        {currentPage + 1}/{totalPages}
      </span>
      <Button
        variant={"outline"}
        size={"icon"}
        onClick={goToNextPage}
        disabled={!hasNextPage}
      >
        <ChevronRight className="size-4" />
      </Button>
      <Button
        variant={"outline"}
        size={"icon"}
        onClick={goToLastPage}
        disabled={!hasNextPage}
      >
        <ChevronsRight className="size-4" />
      </Button>
    </div>
  );
}
