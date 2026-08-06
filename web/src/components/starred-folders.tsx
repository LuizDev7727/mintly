import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Folder, MoreHorizontal, Star, Trash2 } from "lucide-react";
import type { GetStarredFoldersResponse } from "@/http/folder/get-starred-folders.http";
import { getStarredFoldersHttp } from "@/http/folder/get-starred-folders.http";
import { removeStarredFolderHttp } from "@/http/folder/remove-starred-folder.http";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

const MAX_VISIBLE_FOLDERS = 4;

export function StarredFolders() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });
  const queryClient = useQueryClient();

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
    removeStarredFolder({ orgSlug: slug, channelId: channel, folderId });
  }

  if (isLoading) {
    return null;
  }

  const folders = data?.folders ?? [];

  const isStarredFoldersEmpty = folders.length === 0;

  if (isStarredFoldersEmpty) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Starred Folders</SidebarGroupLabel>
      </SidebarGroup>
    );
  }

  const visibleFolders = folders.slice(0, MAX_VISIBLE_FOLDERS);
  const overflowFolders = folders.slice(MAX_VISIBLE_FOLDERS);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Starred Folders</SidebarGroupLabel>
      <SidebarMenu>
        {visibleFolders.map((folder) => (
          <SidebarMenuItem key={folder.id}>
            <SidebarMenuButton
              className="data-[current=true]:bg-sidebar-primary data-[current=true]:text-sidebar-primary-foreground data-[current=true]:font-medium"
              asChild
            >
              <Link
                to={"/orgs/$slug/channels/$channel"}
                params={{ slug, channel }}
              >
                <Folder />
                <span className="truncate">{folder.title}</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuAction
              onClick={() => handleRemoveStarredFolder(folder.id)}
            >
              <Trash2 />
              <span className="sr-only">Remove starred folder</span>
            </SidebarMenuAction>
          </SidebarMenuItem>
        ))}

        {overflowFolders.length > 0 && (
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="text-sidebar-foreground/70">
                  <MoreHorizontal />
                  <span>See all folders</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="min-w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  More starred folders
                </DropdownMenuLabel>
                {overflowFolders.map((folder) => (
                  <DropdownMenuItem
                    key={folder.id}
                    className="justify-between gap-2"
                    onSelect={(event) => event.preventDefault()}
                  >
                    <Link
                      to={"/orgs/$slug/channels/$channel"}
                      params={{ slug, channel }}
                      className="flex min-w-0 flex-1 items-center gap-2"
                    >
                      <Folder className="size-4 shrink-0" />
                      <span className="truncate">{folder.title}</span>
                    </Link>
                    <button
                      type="button"
                      className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveStarredFolder(folder.id)}
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Remove starred folder</span>
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
