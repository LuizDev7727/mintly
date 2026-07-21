import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PostsFilter } from "./posts-filter";
import { getPostsHttp } from "@/http/posts/get-posts.http";
import { useParams } from "@tanstack/react-router";
import { PostListLoading } from "./post-list-loading";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import { PostsPagination } from "./posts-pagination";
import { PostsListEmpty } from "./posts-list-empty";
import { useViewMode } from "@/context/view-mode-context";
import { PostGridView } from "./post-grid-view";
import { PostListView } from "./post-list-view";

export function Posts() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const [currentPage] = useQueryState(
    "post_page",
    parseAsInteger.withDefault(0),
  );

  const [currentFolderId] = useQueryState("folder_id");
  const [titleFilter] = useQueryState(
    "title_filter",
    parseAsString.withDefault(""),
  );

  const { view } = useViewMode();

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", slug, channel, currentFolderId, titleFilter, currentPage],
    queryFn: async () =>
      getPostsHttp({
        orgSlug: slug,
        channelSlug: channel,
        folderId: currentFolderId,
        pageIndex: currentPage,
        titleFilter,
      }),
    placeholderData: keepPreviousData,
  });

  if (error) {
    return <div>Error: {error?.message}</div>;
  }

  if (!data) {
    return null;
  }

  const { posts, meta } = data;
  const { totalPages } = meta;
  const isPostsEmpty = posts.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-x-2">
        <PostsFilter />
        <div className="bg-zinc-900 w-4 rotate-90 h-px" />
        <PostsPagination totalPages={totalPages} />
        <div className="bg-zinc-900 w-4 rotate-90 h-px" />
        <Button>
          <ArrowLeftRight className="size-4" />
          Move to folder
        </Button>
      </div>

      {isLoading && <PostListLoading />}

      {!isPostsEmpty && view === "grid" && <PostGridView posts={posts} />}
      {!isPostsEmpty && view === "list" && <PostListView posts={posts} />}

      {isPostsEmpty && !isLoading && <PostsListEmpty />}
    </div>
  );
}
