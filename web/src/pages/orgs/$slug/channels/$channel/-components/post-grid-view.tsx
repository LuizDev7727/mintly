import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { cancelPostHttp } from "@/http/posts/cancel-post.http";
import type { GetPostsResponse } from "@/http/posts/get-posts.http";
import type { Post } from "@/types/post";
import { formatBytes } from "@/utils/format-bytes";
import { formatDuration } from "@/utils/format-duration";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  Eye,
  Globe,
  HardDrive,
  Image,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { POST_NETWORK_ICONS } from "./post-network-icons";
import { PostStatusBadge } from "./post-status-badge";

type PostGridViewProps = {
  posts: Post[];
};

export function PostGridView({ posts }: PostGridViewProps) {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const queryClient = useQueryClient();

  const { mutateAsync: cancelPost, isPending: isCancellingPost } = useMutation({
    mutationFn: cancelPostHttp,
    onSuccess: (_, variables) => {
      queryClient.setQueriesData<GetPostsResponse>(
        { queryKey: ["posts", slug, channel], exact: false },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            posts: old.posts.map((post) =>
              post.id === variables.postId
                ? { ...post, status: "CANCELED" as const }
                : post,
            ),
          };
        },
      );
    },
  });

  function handleCancelPost(post: Post) {
    cancelPost({ postId: post.id, runId: post.runId });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {posts.map((post) => {
        const hasThumbnail = post.thumbnailUrl !== null;

        const visibleNetworks = post.socialsToPost.slice(0, 2);
        const extraCount = post.socialsToPost.length - visibleNetworks.length;

        const isPostProcessing =
          post.status !== "PUBLISHED" &&
          post.status !== "ERROR" &&
          post.status !== "CANCELED";

        return (
          <div
            key={post.id}
            className="w-full min-w-0 rounded-2xl border border-input p-4"
          >
            <header className="relative mb-3 h-37.5 w-full shrink-0 overflow-hidden rounded-[10px] bg-[#242424]">
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

            <div className="mb-2.5 flex items-start justify-between gap-2">
              <p className="line-clamp-1 min-w-0 flex-1 text-sm font-semibold leading-snug">
                {post.title}
              </p>

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

            <div className="mb-3.5 flex h-7 shrink-0 items-center justify-between gap-2">
              <PostStatusBadge status={post.status} />
              {isPostProcessing && (
                <Button
                  type="button"
                  variant={"destructive"}
                  disabled={isCancellingPost}
                  onClick={() => handleCancelPost(post)}
                >
                  {isCancellingPost ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  Cancel
                </Button>
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
                <p className="text-[13px]">
                  {post.duration ? formatDuration(post.duration) : "-"}
                </p>
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
                <span className="text-xs">
                  {post.socialsToPost.length} Selected
                </span>
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
                        {POST_NETWORK_ICONS[network.social]}
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
      })}
    </div>
  );
}
