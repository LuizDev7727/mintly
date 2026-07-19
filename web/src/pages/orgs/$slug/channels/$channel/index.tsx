import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FoldersList } from "./-components/folders-list";
import { CurrentFolderBadge } from "./-components/current-folder-badge";
import { Posts } from "./-components/posts";

export const Route = createFileRoute("/orgs/$slug/channels/$channel/")({
  head: () => ({
    meta: [
      {
        name: "See all posts",
      },
      { title: "Posts | Mintly" },
    ],
  }),
  component: ChannelPage,
});

function ChannelPage() {
  const { slug, channel } = Route.useParams();

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <h1 className="text-xl font-semibold">My Posts</h1>
          <CurrentFolderBadge />
        </div>
        <div className="flex items-center gap-x-2">
          <Button asChild>
            <Link
              to="/orgs/$slug/channels/$channel/create-upload"
              params={{ slug, channel }}
            >
              <Plus className="size-4" />
              New Post
            </Link>
          </Button>
        </div>
      </header>

      <FoldersList />

      <Separator />

      <Posts />
    </div>
  );
}
