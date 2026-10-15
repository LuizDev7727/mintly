import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { authClient } from "@/lib/auth";
import { NavUser } from "@/components/nav-user";
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb";


export const Route = createFileRoute("/orgs/$slug")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    const isSessionEmpty = session === null;

    if (isSessionEmpty) {
      throw redirect({ to: "/" });
    }
  },
  component: OrganizationLayout,
});

function OrganizationLayout() {

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky border-b border-input top-0 z-10 flex items-center justify-between bg-sidebar h-16.25 shrink-0 gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 pr-4">
          <div className="flex min-w-0 items-center gap-x-2 px-2">
            <SidebarTrigger />
            <NavigationBreadcrumb/>
          </div>
          <div className="flex items-center gap-x-3">
            <div className="bg-border h-5 w-px" />
            <NavUser/>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
