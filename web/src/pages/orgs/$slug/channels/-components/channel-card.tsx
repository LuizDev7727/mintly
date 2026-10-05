import { Link, useParams } from "@tanstack/react-router";
import { TvMinimal } from "lucide-react";
import type { Channel } from "@/types/channel";
import { dayjs } from "@/lib/dayjs";
import { Separator } from "@/components/ui/separator";

interface ChannelCardProps {
  channel: Channel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const { slug } = useParams({ from: "/orgs/$slug" });

  return (
    <Link
      to="/orgs/$slug/channels/$channel"
      params={{ slug, channel: channel.id }}
      className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 dark:bg-zinc-900/20"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-sidebar text-muted-foreground">
          <TvMinimal className="size-5" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold leading-tight">
            {channel.name}
          </h3>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground line-clamp-2">
        {channel.description || "No description"}
      </p>

      <Separator className="mt-5 mb-4" />

      <div className="mt-auto flex items-center justify-start text-xs text-muted-foreground">
        <span>
          Created{" "}
          <span className="text-foreground">
            {dayjs(channel.createdAt).format("MMM D, YYYY")}
          </span>
        </span>
      </div>
    </Link>
  );
}
