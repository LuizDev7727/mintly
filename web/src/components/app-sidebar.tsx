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
import { NavSecondary } from "./nav-secondary";
import { Separator } from "./ui/separator";
import { StarredFolders } from "./starred-folders";

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
        {
          isChannelRoute && (
            <>
              <div className="px-4">
                <Separator />
              </div>
              <StarredFolders />
            </>
          )
        }
        <NavSecondary />
      </SidebarContent>
      <SidebarFooter>
        {/*<ThemeToggle />*/}
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
