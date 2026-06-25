import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { createFolderHttp } from "@/http/folder/create-folder.http";
import type { GetFoldersResponse } from "@/http/folder/get-folders.http";
import {
  createFolderSchema,
  type CreateFolderFormType,
} from "@/schemas/folder/create-folder.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { FolderPlus } from "lucide-react";
import { useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function CreateFolderForm() {
  const [currentFolder] = useQueryState("folder", {
    defaultValue: "Default",
  });
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });
  const queryClient = useQueryClient();

  const foldersKey = ["folders", slug, channel, currentFolder];

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateFolderFormType>({
    resolver: zodResolver(createFolderSchema),
  });

  const { mutateAsync } = useMutation({
    mutationFn: createFolderHttp,
    onSuccess: (data, variables) => {
      const { folderId } = data;
      const { title } = variables;

      const newFolder = {
        id: folderId,
        title,
        postsCount: 0,
      };

      queryClient.setQueryData<GetFoldersResponse>(foldersKey, (oldData) => {
        if (!oldData) {
          return undefined;
        }

        return {
          ...oldData,
          folders: [newFolder, ...oldData.folders],
        };
      });

      toast("Folder created successfully");
    },
  });

  async function handleCreateFolder(newFolder: CreateFolderFormType) {
    const { name } = newFolder;
    await mutateAsync({
      channelSlug: channel,
      parentFolderId: currentFolder,
      orgSlug: slug,
      title: name,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleCreateFolder)}>
      <Label htmlFor="name">Name</Label>
      <Input
        id="name"
        {...register("name")}
        type="text"
        placeholder="Folder Name"
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Spinner /> : <FolderPlus />}
        Create Folder
      </Button>
    </form>
  );
}
