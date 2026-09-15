import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

type ProjectsPaginationProps = {
  totalPages: number;
  totalCount: number;
};

export function ProjectsPagination({
  totalPages,
  totalCount,
}: ProjectsPaginationProps) {
  const [currentPage, setCurrentPage] = useQueryState(
    "project_page",
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

  const projectCountLabel = `${totalCount} ${totalCount === 1 ? "project" : "projects"}`;

  return (
    <div className="flex items-center justify-between gap-x-2">
      <p className="text-xs text-muted-foreground">{projectCountLabel}</p>

      <div className="flex items-center gap-x-2">
        <Button
          variant={"outline"}
          size={"icon"}
          onClick={goToFirstPage}
          disabled={!hasPreviousPage}
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          onClick={goToPreviousPage}
          disabled={!hasPreviousPage}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-xs text-muted-foreground px-1 tabular-nums">
          Page {currentPage + 1} of {totalPages}
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
    </div>
  );
}
