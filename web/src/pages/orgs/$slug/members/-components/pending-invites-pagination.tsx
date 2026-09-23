import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

type PendingInvitesPaginationProps = {
  totalPages: number;
  totalCount: number;
};

export function PendingInvitesPagination({
  totalPages,
  totalCount,
}: PendingInvitesPaginationProps) {
  const [currentPage, setCurrentPage] = useQueryState(
    "invites_page",
    parseAsInteger.withDefault(0),
  );

  const lastPage = Math.max(totalPages - 1, 0);

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
    setCurrentPage(lastPage);
  }

  const hasPreviousPage = currentPage > 0;
  const hasNextPage = currentPage < lastPage;

  const inviteCountLabel = `${totalCount} ${totalCount === 1 ? "invite" : "invites"}`;

  return (
    <div className="flex items-center justify-between gap-x-2">
      <p className="text-xs text-muted-foreground">{inviteCountLabel}</p>

      <div className="flex items-center gap-x-2">
        <Button
          variant={"outline"}
          size={"icon"}
          aria-label="First page"
          onClick={goToFirstPage}
          disabled={!hasPreviousPage}
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          aria-label="Previous page"
          onClick={goToPreviousPage}
          disabled={!hasPreviousPage}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-xs text-muted-foreground px-1 tabular-nums">
          Page {currentPage + 1} of {Math.max(totalPages, 1)}
        </span>
        <Button
          variant={"outline"}
          size={"icon"}
          aria-label="Next page"
          onClick={goToNextPage}
          disabled={!hasNextPage}
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          aria-label="Last page"
          onClick={goToLastPage}
          disabled={!hasNextPage}
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
