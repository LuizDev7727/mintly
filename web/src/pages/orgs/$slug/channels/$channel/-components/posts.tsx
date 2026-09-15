import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPostsHttp } from "@/http/posts/get-posts.http";
import { useParams } from "@tanstack/react-router";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import { PostsPagination } from "./posts-pagination";
import { PostsListEmpty } from "./posts-list-empty";
import { useViewMode } from "@/context/view-mode-context";
import { PostGridView } from "./post-grid-view";
import { PostListView } from "./post-list-view";
import { PostsLoading } from "./posts-loading";

const POST_STATUSES = [
  "PROCESSING",
  "SCHEDULED",
  "ERROR",
  "PUBLISHED",
  "ENCODING",
  "GENERATING_METADATA",
  "GENERATING_THUMBNAIL",
  "TRANSCRIBING",
  "SEO_GENERATING",
  "PUBLISHING",
  "CANCELED",
] as const;

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

  const [statusFilter] = useQueryState(
    "status_filter",
    parseAsStringLiteral(POST_STATUSES),
  );

  const [ownerFilter] = useQueryState("owner_filter");

  const { view } = useViewMode();

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "posts",
      slug,
      channel,
      currentFolderId,
      titleFilter,
      statusFilter,
      ownerFilter,
      currentPage,
    ],
    queryFn: async () =>
      getPostsHttp({
        orgSlug: slug,
        channelSlug: channel,
        folderId: currentFolderId,
        pageIndex: currentPage,
        titleFilter,
        statusFilter,
        ownerId: ownerFilter ?? null,
      }),
    placeholderData: keepPreviousData,
  });

  if (error) {
    return <div>Error: {error?.message}</div>;
  }

  if (!data || isLoading) {
    return <PostsLoading />
  }

  const { posts, meta } = data;
  const { totalPages, totalCount } = meta;
  const isPostsEmpty = posts.length === 0;

  return (
    <div className="space-y-4">
      {!isPostsEmpty && view === "grid" && <PostGridView posts={posts} />}
      {!isPostsEmpty && view === "list" && <PostListView posts={posts} />}

      {isPostsEmpty && !isLoading && <PostsListEmpty />}

      {!isPostsEmpty && (
        <PostsPagination totalPages={totalPages} totalCount={totalCount} />
      )}
    </div>
  );
}
