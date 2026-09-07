import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dayjs } from "@/lib/dayjs";
import type { Post } from "@/types/post";
import { formatDuration } from "@/utils/format-duration";
import { Link } from "@tanstack/react-router";
import { Eye, ImageIcon, MoreHorizontal, Trash2 } from "lucide-react";
import { PostStatusBadge } from "./post-status-badge";
import { getInitials } from "@/utils/get-initials";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ImageGeneration } from "@/components/image-generation";
import { useRealtimeRun, useRealtimeStream } from "@trigger.dev/react-hooks";
import { AnimatedCircularProgressBar } from "@/components/animated-circular-progress";

type PostGridCardProps = {
  post: Post;
  slug: string;
  channel: string;
  isSelected: boolean;
  isCancellingPost: boolean;
  onSelect: () => void;
  onCancel: () => void;
};

export function PostGridCard({
  post,
  slug,
  channel,
  isSelected,
  isCancellingPost,
  onSelect,
  onCancel,
}: PostGridCardProps) {
  // Whether the post was still processing at the time it was fetched —
  // decides if we subscribe at all. Once subscribed, `status` below reflects
  // the live value from the run's metadata instead.
  const wasProcessingOnLoad =
    post.status !== "PUBLISHED" &&
    post.status !== "ERROR" &&
    post.status !== "CANCELED";

  const { run } = useRealtimeRun(post.runId, {
    accessToken: post.realtimeToken ?? undefined,
    enabled: wasProcessingOnLoad && !!post.realtimeToken,
  });

  const status = (run?.metadata?.status as Post["status"] | undefined) ?? post.status;

  const isPostProcessing =
    status !== "PUBLISHED" && status !== "ERROR" && status !== "CANCELED";

  const isEncoding = status === "ENCODING";

  const { parts } = useRealtimeStream<{ percent: number }>(
    post.runId,
    "encoding-progress",
    {
      accessToken: post.realtimeToken ?? undefined,
      enabled: isEncoding && !!post.realtimeToken,
    },
  );

  const encodingProgress = parts.at(-1)?.percent ?? 0;

  return (
    <div
      onClick={onSelect}
      data-selected={isSelected}
      className="cursor-pointer rounded-lg border border-border data-[selected=true]:border-primary bg-sidebar p-2.5 text-card-foreground"
    >
      <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
        {status === "GENERATING_THUMBNAIL" && (
          <ImageGeneration>
            <img
              src={post.thumbnailUrl ?? ""}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </ImageGeneration>
        )}

        {post.thumbnailUrl !== null ? (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        ) : !isEncoding ? (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon size={28} />
          </div>
        ) : null}

        <PostStatusBadge status={status} />

        {isEncoding && (
          <AnimatedCircularProgressBar
            value={encodingProgress}
            gaugePrimaryColor={"#bef264"}
            gaugeSecondaryColor={"var(--border)"}
            className="absolute inset-0 m-auto size-16 text-sm"
          />
        )}

        {/* Duração */}
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white">
          {formatDuration(post.duration ?? 0)}
        </span>
      </div>

      {/* Linha inferior: avatar group + texto + menu */}
      <div className="flex items-start gap-2.5 pt-2.5">
        {/* Avatar group */}
        <AvatarGroup>
          {post.socialsToPost.map((socialToPost) => (
            <Tooltip key={socialToPost.id}>
              <TooltipTrigger asChild>
                <Avatar size="sm">
                  {socialToPost.avatarUrl && (
                    <AvatarImage src={socialToPost.avatarUrl} />
                  )}
                  <AvatarFallback>
                    {getInitials(socialToPost.socialName)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>{socialToPost.socialName}</TooltipContent>
            </Tooltip>
          ))}
        </AvatarGroup>

        {/* Título + meta */}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-semibold leading-snug text-card-foreground">
            {post.title}
          </p>
          <div className="mt-0.75 flex flex-wrap items-center gap-1 text-[12.5px] text-muted-foreground">
            <span>{post.author.name}</span>
            <span>•</span>
            <span>{dayjs(post.createdAt).fromNow()}</span>
          </div>
        </div>

        {/* Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isPostProcessing && (
              <DropdownMenuItem asChild>
                <Button
                  type="button"
                  variant={"destructive"}
                  disabled={isCancellingPost}
                  onClick={onCancel}
                >
                  {isCancellingPost ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  Cancel
                </Button>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link
                to="/orgs/$slug/channels/$channel/$postId"
                params={{ slug, channel, postId: post.id }}
              >
                <Eye className="size-4" />
                View details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
