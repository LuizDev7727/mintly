import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { cancelPostHttp } from "@/http/posts/cancel-post.http";
import type { GetPostsResponse } from "@/http/posts/get-posts.http";
import { dayjs } from "@/lib/dayjs";
import type { Post } from "@/types/post";
import { formatBytes } from "@/utils/format-bytes";
import { formatDuration } from "@/utils/format-duration";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Eye, Image, MoreHorizontal, Trash2, Check, AlertTriangle, Calendar, Ban, Loader2 } from "lucide-react";
import { SocialsToPostAvatarsGroup } from "./socials-to-post-avatars-group";

type PostListViewProps = {
  posts: Post[];
};

type PostStatusBadgeProps = {
  status: Post["status"];
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
    cancelPost({
      orgSlug: slug,
      channelId: channel,
      postId: post.id,
      runId: post.runId,
    });
  }

  function PostStatusBadge({ status }: PostStatusBadgeProps) {
    switch (status) {
      case "PUBLISHED":
        return (
          <Badge>
            <Check size={13} />
            {status}
          </Badge>
        );
      case "ERROR":
        return (
          <Badge variant={"destructive"}>
            <AlertTriangle size={13} />
            {status}
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge variant={"scheduled"}>
            <Calendar size={13} />
            {status}
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge variant={"outline"}>
            <Ban size={13} />
            {status}
          </Badge>
        );
      default:
        return (
          <Badge>
            <Loader2 size={13} className="animate-spin" />
            {status}
          </Badge>
        );
    }
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => {
        const hasThumbnail = post.thumbnailUrl !== null;

        const isPostProcessing =
          post.status !== "PUBLISHED" &&
          post.status !== "ERROR" &&
          post.status !== "CANCELED";

        return (
          <div
            key={post.id}
            className="relative flex items-center justify-between gap-3 rounded-lg border bg-card p-2 pe-3"
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
                  {post.author.name} {" · "}
                  {formatBytes(post.size)} ·{" "}
                  {post.duration ? formatDuration(post.duration) : "-"} ·{" "}
                  {post.publishAt ? dayjs(post.publishAt).format("MMM D") : "Now"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">

              <SocialsToPostAvatarsGroup
                socialsToPost={post.socialsToPost}
              />

              <PostStatusBadge status={post.status} />

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
                  {isPostProcessing && (
                    <DropdownMenuItem asChild>
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
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
