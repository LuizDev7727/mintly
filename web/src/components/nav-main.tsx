import { useQuery } from "@tanstack/react-query";
import {
  AnimatedSidebarMenu,
  AnimatedSidebarMenuItem,
} from "./animated-sidebar-menu";
import { SidebarNavButton } from "./sidebar-nav-button";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuAction,
  SidebarMenuBadge,
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
  Webhook,
  LayoutDashboard
} from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { getMembersCountHttp } from "@/http/organization/get-members-count.http";
import { getChannelsHttp } from "@/http/channel/get-channels.http";

export function NavMain() {
  const { slug } = useParams({ from: "/orgs/$slug" });

  const { data: channelsData } = useQuery({
    queryKey: ["channels", slug],
    queryFn: () => getChannelsHttp({ orgSlug: slug  }),
  });

  const { data: membersCountData } = useQuery({
    queryKey: ["members-count", slug],
    queryFn: () => getMembersCountHttp({ orgSlug: slug }),
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Organization</SidebarGroupLabel>
      <AnimatedSidebarMenu>
        <AnimatedSidebarMenuItem>
          <SidebarNavButton icon={LayoutDashboard} label="Overview" description="Summary of your organization's activity" to={"/orgs/$slug"} params={{ slug }} activeOptions={{ exact: true }} />
        </AnimatedSidebarMenuItem>

        <AnimatedSidebarMenuItem>
          <SidebarNavButton icon={TvMinimal} label="Channels" description="Manage your organization's channels" to={"/orgs/$slug/channels"} params={{ slug }} />
          {
            channelsData && <SidebarMenuBadge>{channelsData.channels.length}</SidebarMenuBadge>
          }
        </AnimatedSidebarMenuItem>

        <AnimatedSidebarMenuItem>
          <SidebarNavButton icon={ChartPieIcon} label="Usage & Billing" description="Track usage, costs and billing" to={"/orgs/$slug/usage"} params={{ slug }} />
        </AnimatedSidebarMenuItem>

        <AnimatedSidebarMenuItem>
          <SidebarNavButton icon={Activity} label="Activities" description="History of actions in your organization" to={"/orgs/$slug/activities"} params={{ slug }} />
        </AnimatedSidebarMenuItem>

        <AnimatedSidebarMenuItem>
          <SidebarNavButton icon={Webhook} label="API & Webhooks" description="Manage API keys and webhooks" to={"/orgs/$slug/webhooks"} params={{ slug }} />
        </AnimatedSidebarMenuItem>

        <AnimatedSidebarMenuItem>
          <SidebarNavButton icon={UsersIcon} label="Members" description="Manage members and invitations" to={"/orgs/$slug/members"} params={{ slug }} />
          {
            membersCountData && <SidebarMenuBadge>{membersCountData.count}</SidebarMenuBadge>
          }
        </AnimatedSidebarMenuItem>

        <Collapsible>
          <AnimatedSidebarMenuItem>
            <SidebarNavButton icon={Settings2Icon} label="Settings" description="Manage organization settings" to={"/orgs/$slug/settings"} params={{ slug }} />
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="cursor-pointer data-[state=open]:rotate-90 ">
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
              </SidebarMenuSub>
            </CollapsibleContent>
          </AnimatedSidebarMenuItem>
        </Collapsible>
      </AnimatedSidebarMenu>
    </SidebarGroup>
  );
}
