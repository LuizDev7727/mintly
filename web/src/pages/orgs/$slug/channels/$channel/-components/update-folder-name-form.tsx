import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { GetFoldersResponse } from "@/http/folder/get-folders.http";
import { updateFolderHttp } from "@/http/folder/update-folder.http";
import {
  updateFolderSchema,
  type UpdateFolderFormType,
} from "@/schemas/folder/update-folder.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { FolderPen } from "lucide-react";
import { useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type UpdateFolderNameFormProps = {
  folderId: string;
  folderName: string;
};
export function UpdateFolderNameForm({
  folderId,
  folderName,
}: UpdateFolderNameFormProps) {
  const [currentFolder] = useQueryState("folder", {
    defaultValue: "Default",
  });
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const queryClient = useQueryClient();

  const folderQueryKey = ["folders", slug, channel, currentFolder];

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, dirtyFields },
  } = useForm<UpdateFolderFormType>({
    resolver: zodResolver(updateFolderSchema),
    defaultValues: {
      name: folderName,
    },
  });

  const hasFolderNameChanged = dirtyFields.name !== undefined;

  const { mutateAsync } = useMutation({
    mutationFn: updateFolderHttp,
    onSuccess: (_, variables) => {
      const { title } = variables;
      queryClient.setQueryData<GetFoldersResponse>(folderQueryKey, (old) => {
        if (!old) {
          return;
        }

        const updatedFolder = old.folders.map((folder) =>
          folder.id === folderId ? { ...folder, title } : folder,
        );

        return {
          ...old,
          folders: updatedFolder,
        };
      });

      toast("Folder updated successfully");
    },
  });

  async function handleUpdateFolder(formBody: UpdateFolderFormType) {
    await mutateAsync({
      folderId,
      title: formBody.name,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleUpdateFolder)}>
      <Label>Folder name</Label>
      <Input {...register("name")} placeholder={folderName} />
      <Button disabled={!hasFolderNameChanged} className="w-full" type="submit">
        {isSubmitting ? <Spinner /> : <FolderPen />}
        Update Folder
      </Button>
    </form>
  );
}
