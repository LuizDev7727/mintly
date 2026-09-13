import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GetStarredFoldersResponse } from "@/http/folder/get-starred-folders.http";
import { removeStarredFolderHttp } from "@/http/folder/remove-starred-folder.http";
import { setStarredFolderHttp } from "@/http/folder/set-starred-folder.http";
import { toast } from "sonner";

type StarFolderButtonProps = {
  folderId: string;
  folderTitle: string;
  folderPostsCount: number;
  folderIsStarred: boolean;
};

export function StarFolderButton({
  folderId,
  folderTitle,
  folderPostsCount,
  folderIsStarred,
}: StarFolderButtonProps) {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });
  const queryClient = useQueryClient();

  const starredFoldersQueryKey = ["starred-folders", slug, channel];

  const { mutate: starFolder, isPending: isStarring } = useMutation({
    mutationFn: () =>
      setStarredFolderHttp({ orgSlug: slug, channelId: channel, folderId }),
    onSuccess: () => {
      queryClient.setQueryData<GetStarredFoldersResponse>(
        starredFoldersQueryKey,
        (old) => {
          const folders = old?.folders ?? [];

          if (folders.some((folder) => folder.id === folderId)) {
            return old;
          }

          return {
            folders: [
              ...folders,
              {
                id: folderId,
                title: folderTitle,
                postsCount: folderPostsCount,
              },
            ],
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey: ["folders", slug, channel],
        exact: false,
      });
      toast("Folder starred");
    },
  });

  const { mutate: unstarFolder, isPending: isUnstarring } = useMutation({
    mutationFn: () =>
      removeStarredFolderHttp({ orgSlug: slug, channelId: channel, folderId }),
    onSuccess: () => {
      queryClient.setQueryData<GetStarredFoldersResponse>(
        starredFoldersQueryKey,
        (old) => ({
          folders: (old?.folders ?? []).filter(
            (folder) => folder.id !== folderId,
          ),
        }),
      );

      queryClient.invalidateQueries({
        queryKey: ["folders", slug, channel],
        exact: false,
      });
      toast("Folder unstarred");
    },
  });

  const isPending = isStarring || isUnstarring;

  function handleToggleStar() {
    if (folderIsStarred) {
      unstarFolder();
    } else {
      starFolder();
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full flex justify-start"
      disabled={isPending}
      onClick={handleToggleStar}
    >
      <Star className="size-4" />
      {folderIsStarred ? "Unstar Folder" : "Star Folder"}
    </Button>
  );
}
