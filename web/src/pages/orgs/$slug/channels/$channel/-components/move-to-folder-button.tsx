import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import {
  ArrowLeft,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  FolderIcon,
  FolderRoot,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getFoldersHttp, type GetFoldersResponse } from "@/http/folder/get-folders.http";
import { movePostsToFolderHttp } from "@/http/posts/move-posts-to-folder.http";
import { FolderListLoading } from "./folder-list-loading";

export function MoveToFolderButton() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });
  const queryClient = useQueryClient();

  const [postsSelected, setPostsSelected] = useQueryState(
    "rows",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [sourceFolderId] = useQueryState("folder_id");

  const [open, setOpen] = useState(false);
  const [browsingFolderId, setBrowsingFolderId] = useState<string | null>(null);
  const [browsingFolderTitle, setBrowsingFolderTitle] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const isNoPostsSelected = postsSelected.length === 0;
  const isRoot = browsingFolderId === null;

  const { data, isLoading } = useQuery({
    queryKey: ["folders", slug, channel, browsingFolderId, page],
    queryFn: () =>
      getFoldersHttp({
        orgSlug: slug,
        channelId: channel,
        folderId: browsingFolderId,
        page,
      }),
    enabled: open,
    placeholderData: keepPreviousData,
  });

  const { mutateAsync: movePostsToFolder, isPending: isMoving } = useMutation({
    mutationFn: movePostsToFolderHttp,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts", slug, channel],
        exact: false,
      });

      const movedCount = postsSelected.length;

      queryClient.setQueriesData<GetFoldersResponse>(
        { queryKey: ["folders", slug, channel], exact: false },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            folders: old.folders.map((folder) => {
              if (folder.id === sourceFolderId) {
                return {
                  ...folder,
                  postsCount: Math.max(0, folder.postsCount - movedCount),
                };
              }

              if (folder.id === browsingFolderId) {
                return {
                  ...folder,
                  postsCount: folder.postsCount + movedCount,
                };
              }

              return folder;
            }),
          };
        },
      );

      toast(`${movedCount} post(s) moved successfully`);
      setPostsSelected([]);
      setOpen(false);
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setBrowsingFolderId(null);
      setBrowsingFolderTitle(null);
      setPage(0);
    }
  }

  function handleEnterFolder(folderId: string, folderTitle: string) {
    setBrowsingFolderId(folderId);
    setBrowsingFolderTitle(folderTitle);
    setPage(0);
  }

  function handleBackToParent() {
    setBrowsingFolderId(data?.parent?.id ?? null);
    setBrowsingFolderTitle(data?.parent?.title ?? null);
    setPage(0);
  }

  function handleBackToRoot() {
    setBrowsingFolderId(null);
    setBrowsingFolderTitle(null);
    setPage(0);
  }

  async function handleMoveHere() {
    await movePostsToFolder({
      orgSlug: slug,
      channelId: channel,
      postIds: postsSelected,
      folderId: browsingFolderId,
    });
  }

  const folders = data?.folders ?? [];
  const parent = data?.parent ?? null;
  const totalPages = data?.meta.totalPages ?? 1;
  const hasNextPage = page < totalPages - 1;
  const isFoldersEmpty = !isLoading && folders.length === 0;
  const foldersFoundCount = folders.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={isNoPostsSelected}>
          <ArrowLeftRight className="size-4" />
          Move to folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move {postsSelected.length} post(s)</DialogTitle>
          <DialogDescription>
            Browse into a folder and confirm below to move the selected posts there.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={isRoot}
            onClick={handleBackToParent}
          >
            <ArrowLeft className="size-4" />
            {parent ? `Back to ${parent.title}` : "Back to Root"}
          </Button>
          {!isRoot && (
            <Button variant="ghost" size="sm" onClick={handleBackToRoot}>
              <FolderRoot className="size-4" />
              Root
            </Button>
          )}
        </div>

        {!isLoading && (
          <p className="text-xs text-muted-foreground">
            {foldersFoundCount} folder{foldersFoundCount === 1 ? "" : "s"} found
          </p>
        )}

        <div className="h-64 overflow-y-auto rounded-md border p-2">
          {isLoading ? (
            <FolderListLoading />
          ) : isFoldersEmpty ? (
            <p className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
              No subfolders here.
            </p>
          ) : (
            <div className="space-y-1.5">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => handleEnterFolder(folder.id, folder.title)}
                  className="flex w-full items-center gap-x-3 rounded-lg border border-border p-2.5 text-left transition-colors hover:border-primary/40"
                >
                  <div className="shrink-0 rounded-md bg-primary/10 p-2 text-primary">
                    <FolderIcon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {folder.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {folder.postsCount} posts
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-x-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              {page + 1} of {totalPages}
            </p>
            <Button
              variant="outline"
              size="icon"
              disabled={!hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}

        <DialogFooter className="items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Moving to:{" "}
            <span className="font-medium text-foreground">
              {browsingFolderTitle ?? "Root"}
            </span>
          </p>
          <Button onClick={handleMoveHere} disabled={isMoving}>
            {isMoving ? (
              <Spinner className="size-4" />
            ) : (
              <ArrowLeftRight className="size-4" />
            )}
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
