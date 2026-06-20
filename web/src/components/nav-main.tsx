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
import { useParams } from "@tanstack/react-router";
import { NavLink } from "./nav-link";

export function NavMain() {
  const { slug } = useParams({ from: "/orgs/$slug" });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Organization</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary/10 data-[current=true]:text-sidebar-primary data-[current=true]:font-medium"
            asChild
          >
            <NavLink
              to={"/orgs/$slug"}
              params={{ slug }}
              activeOptions={{ exact: true }}
            >
              <TvMinimal />
              <span>Channels</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary/10 data-[current=true]:text-sidebar-primary data-[current=true]:font-medium"
            asChild
          >
            <NavLink to={"/orgs/$slug/usage"} params={{ slug }}>
              <ChartPieIcon />
              <span>Usage</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary/10 data-[current=true]:text-sidebar-primary data-[current=true]:font-medium"
            asChild
          >
            <NavLink to={"/orgs/$slug/members"} params={{ slug }}>
              <UsersIcon />
              <span>Members</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary/10 data-[current=true]:text-sidebar-primary data-[current=true]:font-medium"
            asChild
          >
            <NavLink to={"/orgs/$slug/settings"} params={{ slug }}>
              <Settings2Icon />
              <span>Settings</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
