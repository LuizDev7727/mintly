import { Link, useParams } from "@tanstack/react-router";
import { Pencil, TvMinimal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Channel } from "@/types/channel";
import { dayjs } from "@/lib/dayjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChannelCardProps {
  channel: Channel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const { slug } = useParams({ from: "/orgs/$slug" });

  return (
    <Link
      to="/orgs/$slug/channels/$channel"
      params={{ slug, channel: channel.id }}
      className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-lg border dark:bg-zinc-900/20"
    >
      <div className="flex items-start justify-between gap-2 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-sidebar">
            <TvMinimal className="size-4" />
          </div>
          <h3 className="truncate font-semibold leading-tight">
            {channel.name}
          </h3>
        </div>
      </div>

      <p className="px-5 pb-5 text-sm text-muted-foreground line-clamp-2">
        {channel.description || "No description"}
      </p>

      <div className="mt-auto text-sm text-muted-foreground flex items-center justify-between border-t px-5 py-3">
        <span>
          Created{" "}
          <span className="">
            {dayjs(channel.createdAt).format("MMM D, YYYY")}
          </span>
        </span>
      </div>
    </Link>
  );
}
