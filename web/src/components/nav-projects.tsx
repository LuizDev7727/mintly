import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Bot, Projector, Settings, Workflow } from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";

export function NavProjects() {
  const { slug, project } = useParams({ strict: false });

  if (!slug || !project) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Project</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              to={"/orgs/$slug/projects/$project"}
              params={{ slug, project }}
            >
              <Projector />
              <span>Posts</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              to={"/orgs/$slug/projects/$project/ai"}
              params={{ slug, project }}
            >
              <Bot />
              <span>AI</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              to={"/orgs/$slug/projects/$project/integrations"}
              params={{ slug, project }}
            >
              <Workflow />
              <span>Integrations</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              to={"/orgs/$slug/projects/$project/settings"}
              params={{ slug, project }}
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
