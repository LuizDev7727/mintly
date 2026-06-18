import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  ChartPieIcon,
  Settings2Icon,
  TvMinimal,
  UsersIcon,
} from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";

export function NavMain() {
  const { slug } = useParams({ from: "/orgs/$slug" });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Organization</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to={"/orgs/$slug"} params={{ slug }}>
              <TvMinimal />
              <span>Channels</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem className="flex items-center">
          <SidebarMenuButton asChild>
            <Link to={"/orgs/$slug/usage"} params={{ slug }}>
              <ChartPieIcon />
              <span>Usage</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem className="flex items-center">
          <SidebarMenuButton asChild>
            <Link to={"/orgs/$slug/members"} params={{ slug }}>
              <UsersIcon />
              <span>Members</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem className="flex items-center">
          <SidebarMenuButton asChild>
            <Link to={"/orgs/$slug/settings"} params={{ slug }}>
              <Settings2Icon />
              <span>Settings</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
