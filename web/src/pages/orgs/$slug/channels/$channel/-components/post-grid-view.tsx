import { cancelPostHttp } from "@/http/posts/cancel-post.http";
import type { GetPostsResponse } from "@/http/posts/get-posts.http";
import type { Post } from "@/types/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { PostGridCard } from "./post-grid-card";

type PostGridViewProps = {
  posts: Post[];
};

export function PostGridView({ posts }: PostGridViewProps) {

  const [postsSelected, setPostsSelected] = useQueryState(
    "rows",
    parseAsArrayOf(parseAsString).withDefault([])
  )

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

  function handleSetSelected(post: Post) {
    setPostsSelected((prev) => {
      if (prev.includes(post.id)) {
        return prev.filter((id) => id !== post.id);
      }
      return [...prev, post.id];
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {posts.map((post) => (
        <PostGridCard
          key={post.id}
          post={post}
          slug={slug}
          channel={channel}
          isSelected={postsSelected.includes(post.id)}
          isCancellingPost={isCancellingPost}
          onSelect={() => handleSetSelected(post)}
          onCancel={() => handleCancelPost(post)}
        />
      ))}
    </div>
  );
}
