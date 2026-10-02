import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

type InvoicesPaginationProps = {
  totalPages: number;
};

export function InvoicesPagination({ totalPages }: InvoicesPaginationProps) {
  const [currentPage, setCurrentPage] = useQueryState(
    "invoice_page",
    parseAsInteger.withDefault(0),
  );

  function goToPreviousPage() {
    setCurrentPage(currentPage - 1);
  }

  function goToNextPage() {
    setCurrentPage(currentPage + 1);
  }

  const hasPreviousPage = currentPage > 0;
  const hasNextPage = currentPage < totalPages - 1;

  return (
    <div className="flex items-center gap-x-3">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={goToPreviousPage}
        disabled={!hasPreviousPage}
      >
        <ChevronLeft className="size-4" />
        <span className="sr-only">Previous page</span>
      </Button>
      <span className="text-xs text-muted-foreground tabular-nums">
        Page {currentPage + 1} of {Math.max(totalPages, 1)}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={goToNextPage}
        disabled={!hasNextPage}
      >
        <ChevronRight className="size-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
}
