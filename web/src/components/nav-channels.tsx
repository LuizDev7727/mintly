import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Bot, Settings, Workflow, Video, Clapperboard } from "lucide-react";
import { useParams } from "@tanstack/react-router";
import { NavLink } from "./nav-link";
import { getIntegrationsHttp } from "@/http/integration/get-integrations.http";
import { useQuery } from "@tanstack/react-query";

export function NavChannels() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel"
  });

  const { data: integrationsData } = useQuery({
    queryKey: ["integrations", slug],
    queryFn: () => getIntegrationsHttp({ channelId: channel }),
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Channel</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary data-[current=true]:text-sidebar-primary-foreground data-[current=true]:font-medium"
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
            className="data-[current=true]:bg-sidebar-primary data-[current=true]:text-sidebar-primary-foreground data-[current=true]:font-medium"
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
            className="data-[current=true]:bg-sidebar-primary data-[current=true]:text-sidebar-primary-foreground data-[current=true]:font-medium"
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
            className="data-[current=true]:bg-sidebar-primary data-[current=true]:text-sidebar-primary-foreground data-[current=true]:font-medium"
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
          {
            integrationsData && <SidebarMenuBadge>{integrationsData.integrations.length}</SidebarMenuBadge>
          }
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary data-[current=true]:text-sidebar-primary-foreground data-[current=true]:font-medium"
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
