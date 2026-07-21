import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { cancelPostHttp } from "@/http/posts/cancel-post.http";
import type { GetPostsResponse } from "@/http/posts/get-posts.http";
import type { Post } from "@/types/post";
import { formatBytes } from "@/utils/format-bytes";
import { formatDuration } from "@/utils/format-duration";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Eye, Image, MoreHorizontal, Trash2 } from "lucide-react";
import { POST_NETWORK_ICONS } from "./post-network-icons";
import { PostStatusBadge } from "./post-status-badge";

type PostListViewProps = {
  posts: Post[];
};

export function PostListView({ posts }: PostListViewProps) {
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
    <div className="space-y-2">
      {posts.map((post) => {
        const hasThumbnail = post.thumbnailUrl !== null;

        const visibleNetworks = post.socialsToPost.slice(0, 3);
        const extraCount = post.socialsToPost.length - visibleNetworks.length;

        const isPostProcessing =
          post.status !== "PUBLISHED" &&
          post.status !== "ERROR" &&
          post.status !== "CANCELED";

        return (
          <div
            key={post.id}
            className="flex items-center justify-between gap-3 rounded-lg border bg-transparent p-2 pe-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="aspect-video h-12 shrink-0 overflow-hidden rounded bg-[#242424]">
                {hasThumbnail ? (
                  <img
                    src={post.thumbnailUrl ?? ""}
                    alt="Post thumbnail"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-[#888888]">
                    <Image size={16} strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{post.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatBytes(post.size)} ·{" "}
                  {post.duration ? formatDuration(post.duration) : "-"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="flex items-center gap-1">
                {visibleNetworks.map((network) => (
                  <span
                    key={network.id}
                    className="flex size-6 items-center justify-center rounded-full bg-[#0a0a0a]"
                  >
                    {POST_NETWORK_ICONS[network.social]}
                  </span>
                ))}
                {extraCount > 0 && (
                  <span className="rounded-full bg-[#0a0a0a] px-1.75 py-0.5 text-[11px] text-muted-foreground">
                    +{extraCount}
                  </span>
                )}
              </div>

              <PostStatusBadge status={post.status} />

              <span className="text-xs text-muted-foreground">
                {post.author.name}
              </span>

              <span className="text-xs text-muted-foreground">
                {post.publishAt ? post.publishAt.toLocaleDateString() : "Now"}
              </span>

              {isPostProcessing && (
                <Button
                  type="button"
                  variant={"destructive"}
                  size={"icon-sm"}
                  disabled={isCancellingPost}
                  onClick={() => handleCancelPost(post)}
                >
                  {isCancellingPost ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant={"ghost"} size={"icon-sm"}>
                    <MoreHorizontal className="size-4" />
                  </Button>
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
          </div>
        );
      })}
    </div>
  );
}
