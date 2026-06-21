import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  ChartPieIcon,
  ChevronsUpDown,
  Building,
  Settings2Icon,
  TvMinimal,
  UsersIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: TvMinimal, label: "Channels" },
  { icon: ChartPieIcon, label: "Usage" },
  { icon: UsersIcon, label: "Members" },
  { icon: Settings2Icon, label: "Settings" },
];

export function PlatformLoading() {
  return (
    <div className="pointer-events-none select-none">
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Building className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left gap-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                  <ChevronsUpDown className="ml-auto opacity-40" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <div className="px-2 pt-2">
              <Skeleton className="h-3 w-20 mb-2 ml-2" />
              <SidebarMenu>
                {NAV_ITEMS.map(({ icon: Icon, label }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton>
                      <Icon className="opacity-40" />
                      <span className="opacity-40">{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
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
          <header className="flex items-center justify-between dark:bg-zinc-900/20 h-16 shrink-0 gap-2 pr-4">
            <div className="flex items-center gap-2 px-4">
              <Skeleton className="size-7 rounded-md" />
              <div className="bg-zinc-900 w-4 rotate-90 h-px" />
              <Skeleton className="h-8 w-48 rounded-md" />
            </div>
            <div className="flex items-center gap-x-2">
              <Skeleton className="size-8 rounded-md" />
              <div className="bg-zinc-900 w-4 rotate-90 h-px" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          </header>

          <Separator />

          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-9 w-36 rounded-md" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border dark:bg-zinc-900/20 p-5 flex flex-col gap-3"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex flex-wrap gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="w-90 rounded-sm border" key={i}>
                  <header className="p-4 flex items-center gap-x-2">
                    <Skeleton className="size-10 rounded-sm shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-44" />
                    </div>
                  </header>
                </div>
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
