import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GetStarredFoldersResponse } from "@/http/folder/get-starred-folders.http";
import { setStarredFolderHttp } from "@/http/folder/set-starred-folder.http";
import { toast } from "sonner";

type StarFolderButtonProps = {
  folderId: string;
  folderTitle: string;
  folderPostsCount: number;
};

export function StarFolderButton({
  folderId,
  folderTitle,
  folderPostsCount,
}: StarFolderButtonProps) {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });
  const queryClient = useQueryClient();

  const starredFoldersQueryKey = ["starred-folders", slug, channel];

  const { mutate, isPending } = useMutation({
    mutationFn: setStarredFolderHttp,
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
      toast("Folder starred");
    },
  });

  function handleStarFolder() {
    mutate({ orgSlug: slug, channelId: channel, folderId });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full flex justify-start"
      disabled={isPending}
      onClick={handleStarFolder}
    >
      <Star className="size-4" />
      Star Folder
    </Button>
  );
}
