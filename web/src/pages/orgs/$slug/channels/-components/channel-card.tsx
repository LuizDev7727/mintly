import { Link, useParams } from "@tanstack/react-router";
import { ArrowRight, HardDrive, MoreHorizontal, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Channel } from "@/types/channel";
import { formatBytes } from "@/utils/format-bytes";
import { Sparkline } from "@/components/sparkline";

interface ChannelCardProps {
  channel: Channel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const { slug } = useParams({ from: "/orgs/$slug" });

  const { postsSeries } = channel

  const sparklineData = postsSeries;

  const totalPostsSize = postsSeries.reduce((acc, value) => acc + value, 0);

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-lg border dark:bg-zinc-900/20">
      <div className="flex items-start justify-between gap-2 px-5 pt-5">
        <div className="min-w-0">
          <h3 className="truncate font-semibold leading-tight">
            {channel.name}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {channel.postsCount} post(s)
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <Sparkline data={sparklineData} color="#bef264" />

      <div className="flex items-center justify-between gap-2 border-t px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <HardDrive className="size-4" />
            {formatBytes(totalPostsSize)}
          </span>
          <span className="text-[13px] text-border">·</span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Plug className="size-4" />
            {channel.integrationsCount} integration
            {channel.integrationsCount === 1 ? "" : "s"}
          </span>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link
            to="/orgs/$slug/channels/$channel"
            params={{ slug, channel: channel.id }}
          >
            See everything
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
