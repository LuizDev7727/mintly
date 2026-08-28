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
import { cancelPostHttp } from "@/http/posts/cancel-post.http";
import type { GetPostsResponse } from "@/http/posts/get-posts.http";
import { dayjs } from "@/lib/dayjs";
import type { Post } from "@/types/post";
import { formatDuration } from "@/utils/format-duration";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import {
  Eye,
  ImageIcon,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { PostStatusBadge } from "./post-status-badge";
import { getInitials } from "@/utils/get-initials";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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
    cancelPost({
      orgSlug: slug,
      channelId: channel,
      postId: post.id,
      runId: post.runId,
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {posts.map((post) => {

        const isPostProcessing =
          post.status !== "PUBLISHED" &&
          post.status !== "ERROR" &&
          post.status !== "CANCELED";

        return (
          <div
            key={post.id}
            className="rounded-lg border border-border bg-sidebar p-2.5 text-card-foreground"
          >
            <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
              {
                post.thumbnailUrl !== null ?
                  <img src={post.thumbnailUrl} alt={post.title} className="h-full w-full object-cover" />
                  :
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageIcon size={28} />
                  </div>
              }

              <PostStatusBadge status={post.status} />

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
                  {
                    isPostProcessing && (
                      <DropdownMenuItem asChild>
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
                      </DropdownMenuItem>
                    )
                  }
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
