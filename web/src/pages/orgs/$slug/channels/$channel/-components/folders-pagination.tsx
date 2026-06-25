import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

type FoldersPaginationProps = {
  totalFolders: number;
  isLoading: boolean;
};

export function FoldersPagination({
  totalFolders,
  isLoading,
}: FoldersPaginationProps) {
  const [currentPage, setCurrentPage] = useQueryState(
    "folder_page",
    parseAsInteger.withDefault(1),
  );

  const qtdFoldersPerPage = 12;

  const totalPages = Math.ceil(totalFolders / qtdFoldersPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  function goToPreviousPage() {
    setCurrentPage(currentPage - 1);
  }

  function goToNextPage() {
    setCurrentPage(currentPage + 1);
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
