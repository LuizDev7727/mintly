import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/get-initials";
import { Link, useParams } from "@tanstack/react-router";
import { Plug, TvMinimal, Upload } from "lucide-react";

type ChannelCardProps = {
  id: string;
  title: string;
  slug: string;
  postsCount: number;
  integrationsCount: number;
  totalSize: number;
  postsSize: { size: number }[];
};

const CREATED_BY = "John Doe";
const CREATED_AT = "Nov 6, 2025";

export function ChannelCard({
  id,
  title,
  postsCount = 0,
  integrationsCount = 0,
}: ChannelCardProps) {
  const { slug } = useParams({ from: "/orgs/$slug" });

  return (
    <Link
      to="/orgs/$slug/channels/$channel"
      params={{ slug, channel: id }}
      className="min-w-0 w-full rounded-md border border-border bg-transparent hover:dark:bg-zinc-900/20"
    >
      <header className="p-4 flex items-center justify-between gap-x-2">
        <div className="flex items-center justify-center p-2 rounded-md border">
          <TvMinimal className="size-4" />
        </div>
      </header>

      <div className="px-4 pb-4">
        <h3 className="text-[15px] font-semibold leading-[1.3]">{title}</h3>
        <div className="mt-1.5 flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Upload className="size-3.5" />
            {postsCount} posts
          </span>
          <span className="text-[13px] text-border">·</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Plug className="size-3.5" />
            {integrationsCount} integrations
          </span>
        </div>
      </div>

      <footer className="p-4 border border-transparent border-t-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarImage src={undefined} alt={CREATED_BY} />
            <AvatarFallback>{getInitials(CREATED_BY)}</AvatarFallback>
          </Avatar>
          <p className="text-sm text-muted-foreground">{CREATED_BY}</p>
        </div>
        <p className="text-sm text-muted-foreground">Created {CREATED_AT}</p>
      </footer>
    </Link>
  );
}
