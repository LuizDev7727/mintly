import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Channel } from "@/types/channel";
import { getInitials } from "@/utils/get-initials";
import { Link, useParams } from "@tanstack/react-router";
import { Plug, TvMinimal, Upload } from "lucide-react";

type ChannelListViewProps = {
  channels: Channel[];
};

const CREATED_BY = "John Doe";
const CREATED_AT = "Nov 6, 2025";

export function ChannelListView({ channels }: ChannelListViewProps) {
  const { slug } = useParams({ from: "/orgs/$slug" });

  return (
    <div className="space-y-2">
      {channels.map((channel) => (
        <Link
          key={channel.id}
          to="/orgs/$slug/channels/$channel"
          params={{ slug, channel: channel.id }}
          className="flex flex-col gap-3 rounded-md border border-border bg-transparent p-3 hover:dark:bg-zinc-900/20 sm:flex-row sm:items-center sm:justify-between sm:pe-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 items-center justify-center p-2 rounded-md border">
              <TvMinimal className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold leading-[1.3]">
                {channel.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Upload className="size-3.5" />
                  {channel.postsCount} posts
                </span>
                <span className="hidden text-[13px] text-border sm:inline">·</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Plug className="size-3.5" />
                  {channel.integrationsCount} integrations
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 ps-[calc(2rem+0.75rem)] sm:shrink-0 sm:ps-0">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar size="sm">
                <AvatarImage src={channel.avatar ?? undefined} alt={CREATED_BY} />
                <AvatarFallback>{getInitials(CREATED_BY)}</AvatarFallback>
              </Avatar>
              <p className="truncate text-sm text-muted-foreground">{CREATED_BY}</p>
            </div>
            <p className="whitespace-nowrap text-sm text-muted-foreground">
              Created {CREATED_AT}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
