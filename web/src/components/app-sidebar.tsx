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
import { ProjectSwitcher } from "./project-switcher";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";

type AppSidebarProps = ComponentProps<typeof Sidebar>;

export function AppSidebar({ ...props }: AppSidebarProps) {
  const matchRoute = useMatch({
    from: "/orgs/$slug/projects/$project",
    shouldThrow: false,
  });

  const isProjectRoute = !!matchRoute;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher />
        {isProjectRoute && <ProjectSwitcher />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        {isProjectRoute && <NavProjects />}
      </SidebarContent>
      <SidebarFooter>
        {/*<ThemeToggle />*/}
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
