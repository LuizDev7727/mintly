import { Link, useParams } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronsUpDown, PlusCircle, TvMinimal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getChannelsHttp } from "@/http/channel/get-channels.http";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateChannelForm } from "./create-channel-form";
export function ChannelSwitcher() {
  const { isMobile } = useSidebar();
  const { slug, channel: channelId } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const { data } = useSuspenseQuery({
    queryKey: ["channels", slug],
    queryFn: () => getChannelsHttp({ orgSlug: slug }),
  });

  const { channels } = data;

  const currentChannel = channels.find((channel) => channel.id === channelId);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TvMinimal className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentChannel!.name}
                </span>
                <span className="truncate text-xs">
                  {currentChannel!.postsCount} Posts
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Channels
            </DropdownMenuLabel>
            {channels.map((channel) => (
              <DropdownMenuItem
                key={channel.name}
                className="gap-2 p-2 cursor-pointer"
                asChild
              >
                <Link
                  to={"/orgs/$slug/channels/$channel"}
                  params={{ slug, channel: channel.slug }}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <TvMinimal className="size-3.5 shrink-0" />
                  </div>
                  {channel.name}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />

            <Dialog>
              <DialogTrigger asChild>
                <div className="flex items-center gap-2 p-2 cursor-pointer">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <PlusCircle className="size-4" />
                  </div>
                  <span className="font-medium text-muted-foreground">
                    Create channel
                  </span>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create new channel</DialogTitle>
                  <DialogDescription>
                    Create a new channel in your organization.
                  </DialogDescription>
                </DialogHeader>
                <CreateChannelForm />
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
