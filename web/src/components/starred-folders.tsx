import { Link, useParams } from "@tanstack/react-router";
import { Folder, MoreHorizontal } from "lucide-react";
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

// TODO: hardcoded until starred folders are wired to the backend.
const STARRED_FOLDERS = [
  { id: "1", name: "How to build SaaS", clipCount: 12 },
  { id: "2", name: "Product launches", clipCount: 24 },
  { id: "3", name: "Q3 customer success stories", clipCount: 16 },
  { id: "4", name: "Tutorials", clipCount: 12 },
  { id: "5", name: "Webinars", clipCount: 8 },
  { id: "6", name: "Raw footage", clipCount: 47 },
];

const MAX_VISIBLE_FOLDERS = 4;

export function StarredFolders() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const visibleFolders = STARRED_FOLDERS.slice(0, MAX_VISIBLE_FOLDERS);
  const overflowFolders = STARRED_FOLDERS.slice(MAX_VISIBLE_FOLDERS);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Starred Folders</SidebarGroupLabel>
      <SidebarMenu>
        {visibleFolders.map((folder) => (
          <SidebarMenuItem key={folder.id}>
            <SidebarMenuButton
              className="pr-8 data-[current=true]:bg-sidebar-primary data-[current=true]:text-sidebar-primary-foreground data-[current=true]:font-medium"
              asChild
            >
              <Link
                to={"/orgs/$slug/channels/$channel"}
                params={{ slug, channel }}
              >
                <Folder />
                <span className="truncate">{folder.name}</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuBadge>{folder.clipCount}</SidebarMenuBadge>
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
                  <DropdownMenuItem key={folder.id} asChild>
                    <Link
                      to={"/orgs/$slug/channels/$channel"}
                      params={{ slug, channel }}
                      className="justify-between gap-2"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Folder className="size-4 shrink-0" />
                        <span className="truncate">{folder.name}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {folder.clipCount}
                      </span>
                    </Link>
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
