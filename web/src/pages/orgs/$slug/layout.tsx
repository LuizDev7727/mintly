import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { PendingInvites } from "@/components/pending-invites";
import { ThemeToggle } from "@/components/theme-toggle";
import Search from "@/components/search";

export const Route = createFileRoute("/orgs/$slug")({
  beforeLoad: () => {},
  component: OrganizationLayout,
});

function OrganizationLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center justify-between dark:bg-zinc-900/20 h-16 shrink-0 gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 pr-4">
          <div className="flex items-center justify-between gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="bg-zinc-900 w-4 rotate-90 h-px" />
            <Search />
          </div>
          <div className="flex items-center gap-x-2">
            <ThemeToggle />
            <div className="bg-zinc-900 w-4 rotate-90 h-px" />
            <PendingInvites />
          </div>
        </header>
        <Separator />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
