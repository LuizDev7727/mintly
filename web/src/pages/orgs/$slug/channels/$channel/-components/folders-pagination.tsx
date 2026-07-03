import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

type FoldersPaginationProps = {
  totalPages: number;
  currentFolderPage: number;
  isLoading: boolean;
};

export function FoldersPagination({
  totalPages,
  currentFolderPage,
  isLoading,
}: FoldersPaginationProps) {
  const [_, setCurrentFolderPage] = useQueryState(
    "folder_page",
    parseAsInteger.withDefault(0),
  );

  const hasNextPage = currentFolderPage < totalPages;
  const hasPrevPage = currentFolderPage > 0;

  function goToPreviousPage() {
    setCurrentFolderPage(currentFolderPage - 1);
  }

  function goToNextPage() {
    setCurrentFolderPage(currentFolderPage + 1);
  }

  return (
    <div className="flex items-center gap-x-1">
      <Button
        variant="outline"
        disabled={!hasPrevPage || isLoading}
        size="icon"
        onClick={goToPreviousPage}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <p className="text-xs text-muted-foreground">
        {currentFolderPage + 1} of {totalPages}
      </p>
      <Button
        variant="outline"
        disabled={!hasNextPage || isLoading}
        size="icon"
        onClick={goToNextPage}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
