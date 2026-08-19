import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { SwitchViewMode } from "@/components/switch-view-mode";
import { authClient } from "@/lib/auth";
import { MembersAvatarsGroup } from "@/components/members-avatars-group";

export const Route = createFileRoute("/orgs/$slug")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    const hasSession = session === null;

    if (hasSession) {
      throw redirect({ to: "/auth" });
    }
  },
  component: OrganizationLayout,
});

function OrganizationLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center justify-between bg-sidebar h-16 shrink-0 gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 pr-4">
          <div className="flex items-center justify-between gap-2 px-2">
            <SidebarTrigger className="-ml-1" />
            {/*<div className="bg-border w-4 rotate-90 h-px" />*/}
            {/*<NavigationBreadcrumb />*/}
          </div>
          <div className="flex items-center gap-x-2">
            <MembersAvatarsGroup />
            <div className="bg-border w-4 rotate-90 h-px" />
            <SwitchViewMode />
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
