import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Activity,
  ChartPieIcon,
  ChevronRight,
  Settings2Icon,
  TvMinimal,
  UsersIcon,
} from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";
import { NavLink } from "./nav-link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

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
            <NavLink to={"/orgs/$slug/activities"} params={{ slug }}>
              <Activity />
              <span>Activities</span>
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

        <Collapsible>
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
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="cursor-pointer data-[state=open]:rotate-90">
                <ChevronRight />
                <span className="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link
                      to="/orgs/$slug/settings"
                      params={{ slug }}
                      search={{ tab: "general" }}
                    >
                      <span>General</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link
                      to="/orgs/$slug/settings"
                      params={{ slug }}
                      search={{ tab: "billing" }}
                    >
                      <span>Billing</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
