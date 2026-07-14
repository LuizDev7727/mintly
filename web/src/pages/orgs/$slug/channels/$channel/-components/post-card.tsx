import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Post } from "@/types/post";
import { formatBytes } from "@/utils/format-bytes";
import { formatDuration } from "@/utils/format-duration";
import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Globe,
  HardDrive,
  Image,
  Loader2,
  Trash2,
} from "lucide-react";

type PostCardProps = {
  post: Post;
};

const NETWORK_ICONS = {
  YOUTUBE: (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-[#ef4444]">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.4 3.6 12 3.6 12 3.6s-7.4 0-9.4.5A3 3 0 0 0 .5 6.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c2 .5 9.4.5 9.4.5s7.4 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  ),
  TIKTOK: (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-white">
      <path d="M16.6 5.8a4.3 4.3 0 0 1-3-1.3 4.3 4.3 0 0 1-1.3-3H9.1v13a2.6 2.6 0 1 1-1.8-2.5v-3.2a5.8 5.8 0 1 0 5 5.7V9.5a7.3 7.3 0 0 0 4.3 1.4V7.6c-.1 0 0 0 0 0Z" />
    </svg>
  ),
};

export function PostCard({ post }: PostCardProps) {
  const hasThumbnail = post.thumbnailUrl !== null;

  const visibleNetworks = post.socialsToPost.slice(0, 2);
  const extraCount = post.socialsToPost.length - visibleNetworks.length;

  const isPostProcessing =
    post.status !== "PUBLISHED" && post.status !== "ERROR";

  function getPostStatusBadge() {
    switch (post.status) {
      case "PUBLISHED":
        return (
          <Badge>
            <Check size={13} />
            {post.status}
          </Badge>
        );
      case "ERROR":
        return (
          <Badge variant={"destructive"}>
            <AlertTriangle size={13} />
            {post.status}
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge variant={"scheduled"}>
            <Calendar size={13} />
            {post.status}
          </Badge>
        );
      default:
        return (
          <Badge>
            <Loader2 size={13} className="animate-spin" />
            {post.status}
          </Badge>
        );
    }
  }

  return (
    <div className="w-full min-w-0 rounded-2xl border border-input p-4">
      <header className="group relative mb-3 h-37.5 w-full shrink-0 overflow-hidden rounded-[10px] bg-[#242424]">
        {hasThumbnail ? (
          <img
            src={post.thumbnailUrl ?? ""}
            alt="Post thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#888888]">
            <Image size={30} strokeWidth={1.5} />
          </div>
        )}
      </header>

      <p className="mb-2.5 line-clamp-1 shrink-0 text-sm font-semibold leading-snug">
        {post.title}
      </p>

      <div className="mb-3.5 flex h-7 shrink-0 items-center justify-between gap-2">
        {getPostStatusBadge()}
        {isPostProcessing && (
          <>
            <Button type="button" variant={"destructive"}>
              <Trash2 size={13} />
              Cancel
            </Button>
          </>
        )}
      </div>

      <div className="mb-3 grid shrink-0 grid-cols-2 gap-2.5">
        <div className="rounded-[10px] py-2">
          <p className="mb-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <HardDrive size={13} />
            Size
          </p>
          <p className="text-[13px]">{formatBytes(post.size)}</p>
        </div>
        <div className="rounded-[10px] py-2">
          <p className="mb-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock size={13} />
            Duration
          </p>
          <p className="text-[13px]">{post.duration ? formatDuration(post.duration) : "-"}</p>
        </div>
      </div>

      <Separator />

      <div className="mb-3.5 shrink-0 pt-3">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar size={14} />
            Publish At
          </span>
          <span className="text-xs">
            {post.publishAt ? post.publishAt.toLocaleString() : "Now"}
          </span>
        </div>

        <div className="mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Globe size={14} />
            Socials
          </span>
          <span className="text-xs">{post.socialsToPost.length} Selected</span>
        </div>

        <div className="flex h-24 flex-col gap-1.5">
          {post.socialsToPost.map((network, i) => {
            const isLast = i === post.socialsToPost.length - 1;
            return (
              <div
                key={network.id}
                className="flex items-center justify-between gap-2 rounded-[10px] border px-2.5 py-2"
              >
                <div className="flex items-center gap-2">
                  {NETWORK_ICONS[network.social]}
                  <p className="text-xs">{network.socialName}</p>
                </div>
                {isLast && extraCount > 0 && (
                  <span className="shrink-0 rounded-full bg-[#0a0a0a] px-1.75 py-0.5 text-[11px] text-muted-foreground">
                    +{extraCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      <footer className="flex shrink-0 items-center justify-between pt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {post.author.name}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">2 days ago</span>
      </footer>
    </div>
  );
}
