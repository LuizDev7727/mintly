import { Button } from "@/components/ui/button";
import type { Post } from "@/types/post";
import { formatBytes } from "@/utils/format-bytes";
import { formatDuration } from "@/utils/format-duration";
import { Image, Trash2 } from "lucide-react";
import { POST_NETWORK_ICONS } from "./post-network-icons";
import { PostStatusBadge } from "./post-status-badge";

type PostListViewProps = {
  posts: Post[];
};

export function PostListView({ posts }: PostListViewProps) {
  return (
    <div className="space-y-2">
      {posts.map((post) => {
        const hasThumbnail = post.thumbnailUrl !== null;

        const visibleNetworks = post.socialsToPost.slice(0, 3);
        const extraCount = post.socialsToPost.length - visibleNetworks.length;

        const isPostProcessing =
          post.status !== "PUBLISHED" && post.status !== "ERROR";

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
                <Button type="button" variant={"destructive"} size={"icon-sm"}>
                  <Trash2 size={13} />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
