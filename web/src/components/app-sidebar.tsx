import type { ComponentProps } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "./ui/sidebar";
import { OrganizationSwitcher } from "./organization-switcher";
import { ChannelSwitcher } from "./channel-switcher";
import { NavMain } from "./nav-main";
import { useMatch } from "@tanstack/react-router";
import { NavChannels } from "./nav-channels";
import { Separator } from "./ui/separator";
import { StarredFolders } from "./starred-folders";
import { Search } from "./search";
import { ThemeToggle } from "./theme-toggle";
import { PendingInvites } from "./pending-invites";
import { SwitchViewMode } from "./switch-view-mode";

type AppSidebarProps = ComponentProps<typeof Sidebar>;

export function AppSidebar({ ...props }: AppSidebarProps) {

  const { state } = useSidebar();

  const matchRoute = useMatch({
    from: "/orgs/$slug/channels/$channel",
    shouldThrow: false,
  });

  const isChannelRoute = !!matchRoute;

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="flex h-16 items-center justify-between gap-2 px-4 group-data-[state=expanded]:pr-2 transition-[height] duration-200 ease-linear group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:justify-center">
        <img
          src="/logo.svg"
          className="size-6 shrink-0"
        />
      </div>
      <Separator />
      <SidebarHeader>
        <OrganizationSwitcher />
        {
          isChannelRoute && (
            <ChannelSwitcher />
          )
        }
      </SidebarHeader>

      <SidebarContent>
        <div className="px-2">
          <Search />
        </div>
        <div className="hidden px-4 group-data-[collapsible=icon]:block">
          <Separator />
        </div>
        <NavMain />
        {
          isChannelRoute && (
            <>
              <div className="px-4">
                <Separator />
              </div>
              <NavChannels />
              <div className="px-4">
                <Separator />
              </div>
              <StarredFolders />
            </>
          )
        }
      </SidebarContent>

      <SidebarGroup>
        <SidebarGroupLabel>Other</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <div
                data-sidebar={state}
                className="flex items-center gap-2 p-2"
              >
                <div className="flex size-4 shrink-0 items-center justify-center">
                  <ThemeToggle />
                </div>
                {state === "expanded" && (
                  <span>Appearance</span>
                )}
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <div className="flex size-4 shrink-0 items-center justify-center">
                  <PendingInvites/>
                </div>
                <span>Notifications</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex items-center data-[sidebar=collapsed]:px-0">
              <SidebarMenuButton>
                <div className="flex size-4 shrink-0 items-center justify-center">
                  <SwitchViewMode/>
                </div>
                <span>Switch View</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarRail />
    </Sidebar>
  );
}
