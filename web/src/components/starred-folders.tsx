import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Folder, Star, Trash2 } from "lucide-react";
import type { GetStarredFoldersResponse } from "@/http/folder/get-starred-folders.http";
import { getStarredFoldersHttp } from "@/http/folder/get-starred-folders.http";
import { removeStarredFolderHttp } from "@/http/folder/remove-starred-folder.http";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

export function StarredFolders() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const starredFoldersQueryKey = ["starred-folders", slug, channel];

  const { data, isLoading } = useQuery({
    queryKey: starredFoldersQueryKey,
    queryFn: () =>
      getStarredFoldersHttp({ orgSlug: slug, channelId: channel }),
  });

  const { mutate: removeStarredFolder } = useMutation({
    mutationFn: removeStarredFolderHttp,
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<GetStarredFoldersResponse>(
        starredFoldersQueryKey,
        (old) => {
          if (!old) {
            return old;
          }

          return {
            folders: old.folders.filter(
              (folder) => folder.id !== variables.folderId,
            ),
          };
        },
      );
    },
  });

  function handleRemoveStarredFolder(folderId: string) {
    removeStarredFolder({
      orgSlug: slug,
      channelId: channel,
      folderId,
    });
  }

  if (isLoading) {
    return null;
  }

  const folders = data?.folders ?? [];
  const isStarredFoldersEmpty = folders.length === 0;

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <SidebarMenuButton className="cursor-pointer">
                <Star />
                <span>Starred Folders</span>
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent side="right" align="start" className="w-64 p-2">
              <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">
                Starred Folders
              </p>

              {isStarredFoldersEmpty ? (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">
                  No starred folders yet.
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                    >
                      <Link
                        to={"/orgs/$slug/channels/$channel"}
                        params={{ slug, channel }}
                        className="flex min-w-0 flex-1 items-center gap-2 text-sm"
                        onClick={() => setOpen(false)}
                      >
                        <Folder className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{folder.title}</span>
                      </Link>
                      <button
                        type="button"
                        className="shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                        onClick={() => handleRemoveStarredFolder(folder.id)}
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Remove starred folder</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </PopoverContent>
          </Popover>
          {!isStarredFoldersEmpty && (
            <SidebarMenuBadge>{folders.length}</SidebarMenuBadge>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
