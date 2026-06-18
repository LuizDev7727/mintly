import { type ComponentProps } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "./ui/sidebar";
import { OrganizationSwitcher } from "./organization-switcher";
import { NavMain } from "./nav-main";
import { useMatch } from "@tanstack/react-router";
import { ChannelSwitcher } from "./channel-switcher";
import { NavChannels } from "./nav-channels";
import { NavUser } from "./nav-user";

type AppSidebarProps = ComponentProps<typeof Sidebar>;

export function AppSidebar({ ...props }: AppSidebarProps) {
  const matchRoute = useMatch({
    from: "/orgs/$slug/channels/$channel",
    shouldThrow: false,
  });

  const isChannelRoute = !!matchRoute;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher />
        {isChannelRoute && <ChannelSwitcher />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        {isChannelRoute && <NavChannels />}
      </SidebarContent>
      <SidebarFooter>
        {/*<ThemeToggle />*/}
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
