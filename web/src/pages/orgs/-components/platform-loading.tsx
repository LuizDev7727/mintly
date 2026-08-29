import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { OrganizationSwitcherLoading } from "@/components/organization-switcher-loading";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Activity,
  ChartPieIcon,
  ChevronsUpDown,
  LayoutDashboard,
  Moon,
  Settings2Icon,
  TvMinimal,
  UsersIcon,
  Webhook,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: TvMinimal, label: "Channels" },
  { icon: ChartPieIcon, label: "Usage" },
  { icon: Webhook, label: "API & Webhooks", badge: "Beta" },
  { icon: Activity, label: "Activities" },
  { icon: UsersIcon, label: "Members" },
  { icon: Settings2Icon, label: "Settings" },
];

export function PlatformLoading() {
  return (
    <div className="pointer-events-none select-none">
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <OrganizationSwitcherLoading />
          </SidebarHeader>

          <SidebarContent>
            <div className="px-2 pt-2">
              <Skeleton className="h-3 w-20 mb-2 ml-2" />
              <SidebarMenu>
                {NAV_ITEMS.map(({ icon: Icon, label, badge }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton>
                      <Icon className="opacity-40" />
                      <span className="opacity-40">{label}</span>
                    </SidebarMenuButton>
                    {badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>

            <SidebarGroup className="mt-auto">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Moon className="opacity-40" />
                    <span className="opacity-40">Appearance</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Skeleton className="size-4 rounded-full" />
                    <span className="opacity-40">Notifications</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <Skeleton className="size-8 rounded-lg shrink-0" />
                  <div className="grid flex-1 gap-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-32" />
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 opacity-40" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="flex items-center justify-between bg-sidebar h-16 shrink-0 gap-2 pr-4">
            <div className="flex items-center gap-2 px-2">
              <Skeleton className="size-7 rounded-md" />
            </div>
            <div className="flex items-center gap-x-2">
              <Skeleton className="size-8 rounded-full" />
              <div className="bg-border w-4 rotate-90 h-px" />
              <Skeleton className="h-7 w-16 rounded-md" />
            </div>
          </header>

          <Separator />

          <div className="flex flex-1 flex-col gap-4 p-4">
            <div>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border dark:bg-zinc-900/20 p-5 flex flex-col gap-3"
                >
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-14" />
                </div>
              ))}
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border dark:bg-zinc-900/20 overflow-hidden"
                >
                  <div className="px-5 pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <Skeleton className="mt-4 h-16 w-full rounded-none" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, col) => (
                <div
                  key={col}
                  className="flex flex-col gap-4 rounded-lg border dark:bg-zinc-900/20 p-5"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="size-9 shrink-0 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3.5 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
