import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PostsFilter } from "./posts-filter";
import { PostCard } from "./post-card";
import { getPostsHttp } from "@/http/posts/get-posts.http";
import { useParams } from "@tanstack/react-router";
import { PostListLoading } from "./post-list-loading";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import { PostsPagination } from "./posts-pagination";

export function PostsList() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const [currentFolder] = useQueryState("folder", { defaultValue: "Default" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", slug, channel, currentFolder],
    queryFn: async () =>
      getPostsHttp({
        orgSlug: slug,
        channelSlug: channel,
        folderId: currentFolder,
      }),
    placeholderData: keepPreviousData,
  });

  if (error) {
    return <div>Error: {error?.message}</div>;
  }

  if (!data) {
    return null;
  }

  const { posts, total } = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-x-2">
        <PostsFilter />
        <div className="bg-zinc-900 w-4 rotate-90 h-px" />
        <PostsPagination totalPages={total} />
        <div className="bg-zinc-900 w-4 rotate-90 h-px" />
        <Button>
          <ArrowLeftRight className="size-4" />
          Move to folder
        </Button>
      </div>

      {isLoading ? (
        <PostListLoading />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
