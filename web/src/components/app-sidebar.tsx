import { type ComponentProps } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarFooter,
} from "./ui/sidebar";
import { OrganizationSwitcher } from "./organization-switcher";
import { ChannelSwitcher } from "./channel-switcher";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { useMatch } from "@tanstack/react-router";
import { NavChannels } from "./nav-channels";
import { NavSecondary } from "./nav-secondary";
import { Separator } from "./ui/separator";
import { StarredFolders } from "./starred-folders";
import { Search } from "./search";

type AppSidebarProps = ComponentProps<typeof Sidebar>;

export function AppSidebar({ ...props }: AppSidebarProps) {

  const matchRoute = useMatch({
    from: "/orgs/$slug/channels/$channel",
    shouldThrow: false,
  });

  const isChannelRoute = !!matchRoute;

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="flex h-16 items-center justify-between gap-2 px-4 transition-[height] duration-200 ease-linear group-data-[collapsible=icon]:h-12">
        <img src="/logo.svg" className="size-6 shrink-0" />
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
        <NavSecondary />
      </SidebarContent>
      <div className="px-4">
        <Separator />
      </div>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
