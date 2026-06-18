import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Bot, Settings, Workflow, Video, Clapperboard } from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";

export function NavChannels() {
  const { slug, channel } = useParams({ strict: false });

  if (!slug || !channel) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Channel</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              to={"/orgs/$slug/channels/$channel"}
              params={{ slug, channel }}
            >
              <Video />
              <span>Posts</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              to={"/orgs/$slug/channels/$channel/projects"}
              params={{ slug, channel }}
            >
              <Clapperboard />
              <span>Projects</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              to={"/orgs/$slug/channels/$channel/ai"}
              params={{ slug, channel }}
            >
              <Bot />
              <span>AI</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              to={"/orgs/$slug/channels/$channel/integrations"}
              params={{ slug, channel }}
            >
              <Workflow />
              <span>Integrations</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              to={"/orgs/$slug/channels/$channel/settings"}
              params={{ slug, channel }}
            >
              <Settings />
              <span>Settings</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
