import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { ThemeToggle } from "./theme-toggle";
import { PendingInvites } from "./pending-invites";

export function NavSecondary() {
  const { state } = useSidebar();
  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              data-sidebar={state}
              className="flex items-center data-[sidebar=collapsed]:px-0"
            >
              <ThemeToggle />
              {state === "expanded" && (
                <span className="">Appearance</span>
              )}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <PendingInvites/>
              <span>Notifications</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
