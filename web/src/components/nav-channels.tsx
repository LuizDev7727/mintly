import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Bot, Settings, Workflow, Video, Clapperboard } from "lucide-react";
import { useParams } from "@tanstack/react-router";
import { NavLink } from "./nav-link";

export function NavChannels() {
  const { slug, channel } = useParams({ strict: false });

  if (!slug || !channel) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Channel</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary/10 data-[current=true]:text-sidebar-primary data-[current=true]:font-medium"
            asChild
          >
            <NavLink
              to={"/orgs/$slug/channels/$channel"}
              params={{ slug, channel }}
              activeOptions={{ exact: true }}
            >
              <Video />
              <span>Posts</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary/10 data-[current=true]:text-sidebar-primary data-[current=true]:font-medium"
            asChild
          >
            <NavLink
              to={"/orgs/$slug/channels/$channel/projects"}
              params={{ slug, channel }}
            >
              <Clapperboard />
              <span>Projects</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary/10 data-[current=true]:text-sidebar-primary data-[current=true]:font-medium"
            asChild
          >
            <NavLink
              to={"/orgs/$slug/channels/$channel/ai"}
              params={{ slug, channel }}
            >
              <Bot />
              <span>AI</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary/10 data-[current=true]:text-sidebar-primary data-[current=true]:font-medium"
            asChild
          >
            <NavLink
              to={"/orgs/$slug/channels/$channel/integrations"}
              params={{ slug, channel }}
            >
              <Workflow />
              <span>Integrations</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary/10 data-[current=true]:text-sidebar-primary data-[current=true]:font-medium"
            asChild
          >
            <NavLink
              to={"/orgs/$slug/channels/$channel/settings"}
              params={{ slug, channel }}
            >
              <Settings />
              <span>Settings</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
