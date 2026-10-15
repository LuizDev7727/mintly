import {
  type InfiniteData,
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { type DragEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useViewMode } from "@/context/view-mode-context";
import { deleteInspirationalThumbnailHttp } from "@/http/inspirational-thumbnail/delete-inspirational-thumbnail.http";
import { getInspirationalThumbnailsHttp } from "@/http/inspirational-thumbnail/get-inspirational-thumbnails.http";
import type { InspirationalThumbnail } from "@/types/inspirational-thumbnail";
import { DeleteThumbnailsDialog } from "./delete-thumbnails-dialog";
import { InspirationalThumbnailGridView } from "./inspirational-thumbnail-grid-view";
import { InspirationalThumbnailListView } from "./inspirational-thumbnail-list-view";
import { ThumbnailDropzone } from "./thumbnail-dropzone";
import { ThumbnailUploadCard } from "./thumbnail-upload-card";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE_IN_MB,
  useInspirationalThumbnailUploads,
} from "./use-inspirational-thumbnail-uploads";

type InspirationalThumbnailsPage = {
  inspirationalThumbnails: InspirationalThumbnail[];
  nextCursor: string | null;
};

export function InspirationalThumbnails() {
  const queryClient = useQueryClient();

  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });
  const [selectedRows, setSelectedRows] = useQueryState(
    "rows",
    parseAsArrayOf(parseAsString).withDefault([]),
  );

  const { view } = useViewMode();

  const { uploads, addFiles, retryUpload, cancelUpload, dismissUpload } =
    useInspirationalThumbnailUploads();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ["inspirational-thumbnails", channel],
      queryFn: ({ pageParam }) =>
        getInspirationalThumbnailsHttp({
          orgSlug: slug,
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
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
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

  const { mutateAsync: removeInspirationalThumbnail, isPending: isRemoving } =
    useMutation({
      mutationFn: deleteInspirationalThumbnailHttp,
      onSuccess: (_, { inspirationalThumbnailId }) => {
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
      },
    });

  const selectedRowsCount = selectedRows.length;
  const hasSelection = selectedRowsCount > 0;
  const hasThumbnails = inspirationalThumbnails.length > 0;
  const hasUploads = uploads.length > 0;
  const isEmpty = !hasThumbnails && !hasUploads;
  const areAllSelected =
    hasThumbnails && selectedRowsCount === inspirationalThumbnails.length;

  function handleBrowse() {
    fileInputRef.current?.click();
  }

  function handleSelectRow(id: string) {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  }

  function handleSelectAll() {
    setSelectedRows(inspirationalThumbnails.map((thumbnail) => thumbnail.id));
  }

  async function handleDeleteSelectedRows() {
    const results = await Promise.allSettled(
      selectedRows.map((inspirationalThumbnailId) =>
        removeInspirationalThumbnail({
          orgSlug: slug,
          channelId: channel,
          inspirationalThumbnailId,
        }),
      ),
    );

    // mantém selecionadas só as que falharam (o toast de erro é global)
    const failedIds = selectedRows.filter(
      (_, index) => results[index].status === "rejected",
    );
    const deletedCount = selectedRowsCount - failedIds.length;

    if (deletedCount > 0) {
      toast(
        `${deletedCount} ${deletedCount === 1 ? "thumbnail" : "thumbnails"} removed.`,
      );
    }

    setSelectedRows(failedIds);
    setIsDeleteDialogOpen(false);
  }

  function hasFiles(event: DragEvent<HTMLElement>) {
    return event.dataTransfer.types.includes("Files");
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDragging(true);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!hasFiles(event)) return;
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setIsDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  const variant = view === "grid" ? "tile" : "row";

  const leading = (
    <>
      <ThumbnailDropzone variant={variant} onBrowse={handleBrowse} />
      {uploads.map((upload) => (
        <ThumbnailUploadCard
          key={upload.id}
          upload={upload}
          variant={variant}
          onCancel={() => cancelUpload(upload.id)}
          onRetry={() => retryUpload(upload.id)}
          onDismiss={() => dismissUpload(upload.id)}
        />
      ))}
    </>
  );

  return (
    <div
      className="relative min-h-64 space-y-4"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          addFiles(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
      />

      {isEmpty ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImagePlus />
            </EmptyMedia>
            <EmptyTitle>Add your first inspirations</EmptyTitle>
            <EmptyDescription>
              Upload 3 to 10 thumbnails with the style you want us to follow.
              PNG or JPG, up to {MAX_FILE_SIZE_IN_MB} MB each.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" onClick={handleBrowse}>
              Choose images
            </Button>
            <EmptyDescription>or drag and drop them here</EmptyDescription>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {inspirationalThumbnails.length}{" "}
            {inspirationalThumbnails.length === 1
              ? "thumbnail"
              : "thumbnails"}{" "}
            · PNG or JPG, up to {MAX_FILE_SIZE_IN_MB} MB each
          </p>

          {view === "grid" ? (
            <InspirationalThumbnailGridView
              thumbnails={inspirationalThumbnails}
              selectedRows={selectedRows}
              handleSelectRow={handleSelectRow}
            >
              {leading}
            </InspirationalThumbnailGridView>
          ) : (
            <InspirationalThumbnailListView
              thumbnails={inspirationalThumbnails}
              selectedRows={selectedRows}
              handleSelectRow={handleSelectRow}
            >
              {leading}
            </InspirationalThumbnailListView>
          )}
        </>
      )}

      {hasNextPage && (
        <div className="p-2" ref={loadMoreRef}>
          {isFetchingNextPage && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
              <Spinner className="size-5" />
              Loading more...
            </div>
          )}
        </div>
      )}

      {hasSelection && (
        <div className="sticky bottom-4 z-10 mx-auto flex w-fit items-center gap-3 rounded-lg border bg-card px-4 py-2 shadow-lg">
          <p className="text-sm">{selectedRowsCount} selected</p>
          {!areAllSelected && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              Select all
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRows([])}
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 />
            Remove
          </Button>
        </div>
      )}

      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary bg-background/80 backdrop-blur-sm">
          <UploadCloud className="size-8 text-primary" />
          <p className="font-medium">Drop to upload</p>
        </div>
      )}

      <DeleteThumbnailsDialog
        open={isDeleteDialogOpen}
        count={selectedRowsCount}
        isDeleting={isRemoving}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteSelectedRows}
      />
    </div>
  );
}
