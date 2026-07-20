import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { PostDetails } from "./-components/post-details";
import { PostDetailsLoading } from "./-components/post-details-loading";

export const Route = createFileRoute(
  "/orgs/$slug/channels/$channel/$postId/",
)({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "View the details of this post",
      },
      { title: "Post | Mintly" },
    ],
  }),
  component: PostDetailsPage,
});

function PostDetailsPage() {
  const { slug, channel } = Route.useParams();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/orgs/$slug/channels/$channel" params={{ slug, channel }}>
          <ArrowLeft className="size-4" />
          Back to posts
        </Link>
      </Button>

      <Separator />

      <Suspense fallback={<PostDetailsLoading />}>
        <PostDetails />
      </Suspense>
    </div>
  );
}
