import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
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
import { getChannelsHttp } from "@/http/channel/get-channels.http";
import { getMembersHttp } from "@/http/organization/get-members.http";

export function NavMain() {
  const { slug } = useParams({ from: "/orgs/$slug" });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Organization</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary data-[current=true]:text-sidebar-primary-foreground data-[current=true]:font-medium"
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
          <Suspense fallback={null}>
            <ChannelsCountBadge slug={slug} />
          </Suspense>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            className="data-[current=true]:bg-sidebar-primary data-[current=true]:text-sidebar-primary-foreground data-[current=true]:font-medium"
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
            className="data-[current=true]:bg-sidebar-primary data-[current=true]:text-sidebar-primary-foreground data-[current=true]:font-medium"
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
            className="data-[current=true]:bg-sidebar-primary data-[current=true]:text-sidebar-primary-foreground data-[current=true]:font-medium"
            asChild
          >
            <NavLink to={"/orgs/$slug/members"} params={{ slug }}>
              <UsersIcon />
              <span>Members</span>
            </NavLink>
          </SidebarMenuButton>
          <Suspense fallback={null}>
            <MembersCountBadge slug={slug} />
          </Suspense>
        </SidebarMenuItem>

        <Collapsible>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[current=true]:bg-sidebar-primary data-[current=true]:text-sidebar-primary-foreground data-[current=true]:font-medium"
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

function ChannelsCountBadge({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery({
    queryKey: ["channels", slug],
    queryFn: () => getChannelsHttp({ orgSlug: slug }),
  });

  return <SidebarMenuBadge>{data.channels.length}</SidebarMenuBadge>;
}

function MembersCountBadge({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery({
    queryKey: ["members", slug],
    queryFn: () => getMembersHttp({ orgSlug: slug }),
  });

  return <SidebarMenuBadge>{data.members.length}</SidebarMenuBadge>;
}
