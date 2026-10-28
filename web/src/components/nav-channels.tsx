import {
  AnimatedSidebarMenu,
  AnimatedSidebarMenuItem,
} from "./animated-sidebar-menu";
import { SidebarNavButton } from "./sidebar-nav-button";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Bot, Settings, Workflow, Video, Clapperboard, Toolbox } from "lucide-react";
import { useParams } from "@tanstack/react-router";
import { getIntegrationsHttp } from "@/http/integration/get-integrations.http";
import { useQuery } from "@tanstack/react-query";

export function NavChannels() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel"
  });

  const { data: integrationsData } = useQuery({
    queryKey: ["integrations", channel],
    queryFn: () => getIntegrationsHttp({ orgSlug: slug, channelId: channel }),
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Channel</SidebarGroupLabel>
      <AnimatedSidebarMenu>
        <AnimatedSidebarMenuItem>
          <SidebarNavButton icon={Video} label="Posts" description="Browse and manage this channel's posts" to={"/orgs/$slug/channels/$channel"} params={{ slug, channel }} activeOptions={{ exact: true }} />
        </AnimatedSidebarMenuItem>

        <AnimatedSidebarMenuItem>
          <SidebarNavButton icon={Clapperboard} label="Projects" description="Your video projects and generated clips" to={"/orgs/$slug/channels/$channel/projects"} params={{ slug, channel }} />
        </AnimatedSidebarMenuItem>

        <AnimatedSidebarMenuItem>
          <SidebarNavButton icon={Toolbox} label="Brand Kit" description="Visual identity used in your clips" to={"/orgs/$slug/channels/$channel/brand-kit"} params={{ slug, channel }} />
        </AnimatedSidebarMenuItem>

        <AnimatedSidebarMenuItem>
          <SidebarNavButton icon={Bot} label="AI" description="Generate content with AI" to={"/orgs/$slug/channels/$channel/ai"} params={{ slug, channel }} />
        </AnimatedSidebarMenuItem>

        <AnimatedSidebarMenuItem>
          <SidebarNavButton icon={Workflow} label="Integrations" description="Connect your social networks" to={"/orgs/$slug/channels/$channel/integrations"} params={{ slug, channel }} />
          {
            integrationsData && <SidebarMenuBadge>{integrationsData.integrations.length}</SidebarMenuBadge>
          }
        </AnimatedSidebarMenuItem>

        <AnimatedSidebarMenuItem>
          <SidebarNavButton icon={Settings} label="Settings" description="Manage channel settings" to={"/orgs/$slug/channels/$channel/settings"} params={{ slug, channel }} />
        </AnimatedSidebarMenuItem>
      </AnimatedSidebarMenu>
    </SidebarGroup>
  );
}
