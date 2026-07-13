import { useEffect, useRef } from "react";
import { useParams } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useViewMode } from "@/context/view-mode-context";
import { getInspirationalThumbnailsHttp } from "@/http/inspirational-thumbnail/get-inspirational-thumbnails.http";
import { InspirationalThumbnailListView } from "./inspirational-thumbnail-list-view";
import { InspirationalThumbnailGridView } from "./inspirational-thumbnail-grid-view";
import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs'
import { deleteInspirationalThumbnailHttp } from "@/http/inspirational-thumbnail/delete-inspirational-thumbnail.http";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { InspirationalThumbnail } from "@/types/inspirational-thumbnail";

type InspirationalThumbnailsPage = {
  inspirationalThumbnails: InspirationalThumbnail[];
  nextCursor: string | null;
};

export function InspirationalThumbnails() {

  const queryClient = useQueryClient()

  const { channel } = useParams({ from: "/orgs/$slug/channels/$channel" });
  const [selectedRows, setSelectedRow] = useQueryState('rows', parseAsArrayOf(parseAsString).withDefault([]))

  const { view } = useViewMode();

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ["inspirational-thumbnails", channel],
      queryFn: ({ pageParam }) =>
        getInspirationalThumbnailsHttp({
          channelId: channel,
          cursor: pageParam,
        }),
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialPageParam: undefined as string | undefined,
    });

  const inspirationalThumbnails = data.pages.flatMap(
    (page) => page.inspirationalThumbnails,
  );

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function handleSelectRow(id: string) {
    setSelectedRow((prev) => {
      if (prev.includes(id)) {
        return prev.filter((rowId) => rowId !== id);
      }
      return [...prev, id];
    });
  }

  const { mutateAsync: removeInspirationalThumbnail, isPending: isRemoving } = useMutation({
    mutationFn: deleteInspirationalThumbnailHttp,
    onSuccess: (_, variables) => {
      const { inspirationalThumbnailId } = variables
      queryClient.setQueryData<InfiniteData<InspirationalThumbnailsPage>>(
        ["inspirational-thumbnails", channel],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              inspirationalThumbnails: page.inspirationalThumbnails.filter(
                (thumbnail) => thumbnail.id !== inspirationalThumbnailId,
              ),
            })),
          };
        },
      );
      toast("Inspirational thumbnail deleted successfully.")
      setSelectedRow([])
    },
  });

  async function handleDeleteAllSelectedRows() {
    for (let i = 0; i < selectedRows.length; i++) {
      await removeInspirationalThumbnail({
        inspirationalThumbnailId: selectedRows[i],
      });
    }
  }

  if (inspirationalThumbnails.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No inspirational thumbnails uploaded yet.
      </p>
    );
  }

  const selectedRowsCount = selectedRows.length;


  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {selectedRowsCount} selected
        </p>
        <Button variant={'destructive'} onClick={handleDeleteAllSelectedRows} disabled={selectedRowsCount === 0 || isRemoving}>
          {
            isRemoving ? <Spinner className="size-4" /> : <Trash2 className="size-4" />
          }
          Remove
        </Button>
      </div>

      {view === "grid" && (
        <InspirationalThumbnailGridView
          thumbnails={inspirationalThumbnails}
          selectedRows={selectedRows}
          handleSelectRow={handleSelectRow} />
      )}
      {view === "list" && (
        <InspirationalThumbnailListView
          thumbnails={inspirationalThumbnails}
          selectedRows={selectedRows}
          handleSelectRow={handleSelectRow} />
      )}

      {hasNextPage && (
        <div className="p-2" ref={loadMoreRef}>
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-2">
              <Spinner className="size-5" />
              Loading more...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
