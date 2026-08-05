import { Link, useParams } from "@tanstack/react-router";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { Folder } from "lucide-react";

export function StarredFolders() {

  const { slug, channel } = useParams({
    from:"/orgs/$slug/channels/$channel"
  })

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Starred Folders</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary data-[current=true]:text-sidebar-primary-foreground data-[current=true]:font-medium"
            asChild
          >
            <Link
              to={"/orgs/$slug/channels/$channel"}
              params={{ slug, channel }}
            >
              <Folder />
              <span>How to build SaaS</span>
            </Link>
          </SidebarMenuButton>
          <SidebarMenuBadge>12</SidebarMenuBadge>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary data-[current=true]:text-sidebar-primary-foreground data-[current=true]:font-medium"
            asChild
          >
            <Link
              to={"/orgs/$slug/channels/$channel"}
              params={{ slug, channel }}
            >
              <Folder />
              <span>pasldpasdlpasdx</span>
            </Link>
          </SidebarMenuButton>
          <SidebarMenuBadge>
            7
          </SidebarMenuBadge>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
