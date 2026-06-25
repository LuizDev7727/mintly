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
    parseAsInteger.withDefault(1),
  );

  function goToFirstPage() {
    setCurrentPage(1);
  }

  function goToPreviousPage() {
    setCurrentPage(currentPage - 1);
  }

  function goToNextPage() {
    setCurrentPage(currentPage + 1);
  }

  function goToLastPage() {
    setCurrentPage(totalPages);
  }

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const isFirstPage = currentPage === 1;

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
        {currentPage}/{totalPages}
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
