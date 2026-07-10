import { Trash, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFolderHttp } from "@/http/folder/delete-folder.http";
import { Spinner } from "@/components/ui/spinner";
import { useParams } from "@tanstack/react-router";
import { parseAsInteger, useQueryState } from "nuqs";
import type { GetFoldersResponse } from "@/http/folder/get-folders.http";
import { toast } from "sonner";

type DeleteFolderDialogProps = {
  folderName: string;
  folderId: string;
};

export function DeleteFolderDialog({
  folderName,
  folderId,
}: DeleteFolderDialogProps) {
  const [currentFolderId] = useQueryState("folder_id");
  const [currentFolderPage] = useQueryState(
    "folder_page",
    parseAsInteger.withDefault(0),
  );

  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });
  const queryClient = useQueryClient();

  const foldersQueryKey = [
    "folders",
    slug,
    channel,
    currentFolderId,
    currentFolderPage,
  ];

  const { mutateAsync, isPending } = useMutation({
    mutationFn: deleteFolderHttp,
    onSuccess: () => {
      queryClient.setQueryData<GetFoldersResponse>(foldersQueryKey, (old) => {
        if (!old) {
          return;
        }

        const newArray = old.folders.filter((f) => f.id !== folderId);

        return {
          ...old,
          folders: newArray,
        };
      });
      toast("Folder deleted successfully");
    },
  });

  async function handleDeleteFolder() {
    await mutateAsync({ folderId });
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="w-full flex justify-start text-red-400 hover:text-red-500"
          variant={"ghost"}
        >
          <Trash2 />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Folder</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-bold">{folderName}</span> ? All posts inside
            it will be permanently removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleDeleteFolder} variant="destructive">
            {isPending ? <Spinner /> : <Trash className="size-4" />}
            Delete Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
