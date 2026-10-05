import { Button } from "@/components/ui/button";
import { getPostHttp } from "@/http/posts/get-post.http";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PostDetails } from "./-components/post-details";
import { PostDetailsLoading } from "./-components/post-details-loading";

export const Route = createFileRoute(
  "/orgs/$slug/channels/$channel/$postId/",
)({
  loader: ({ params }) => {
    return getPostHttp({
      orgSlug: params.slug,
      channelId: params.channel,
      postId: params.postId,
    });
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        name: "description",
        content:
          loaderData?.description.slice(0, 150) ||
          "View the details of this post",
      },
      { title: loaderData ? `${loaderData.title} | Mintly` : "Generating SEO | Mintly" },
    ],
  }),
  pendingComponent: PostDetailsLoading,
  pendingMs: 0,
  component: PostDetailsPage,
});

function PostDetailsPage() {
  const { slug, channel } = Route.useParams();
  const post = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Button asChild variant="ghost" size="sm" className="-ms-2">
          <Link to="/orgs/$slug/channels/$channel" params={{ slug, channel }}>
            <ArrowLeft className="size-4" />
            Back to posts
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Post details</h1>
      </header>

      <PostDetails post={post} />
    </div>
  );
}
