import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { ThemeToggle } from "./theme-toggle";

export function NavSecondary() {
  const { state } = useSidebar();
  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              data-sidebar={state}
              className="flex items-center justify-between px-2 py-1 data-[sidebar=collapsed]:px-0"
            >
              {state === "expanded" && (
                <span className="text-xs text-muted-foreground">Theme</span>
              )}
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
