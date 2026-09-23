import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FoldersList } from "./-components/folders-list";
import { Posts } from "./-components/posts";
import { CreateFolderDialog } from "./-components/create-folder-dialog";
import { PostsFilter } from "./-components/posts-filter";
import { CurrentFolderBadge } from "./-components/current-folder-badge";

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
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-x-2">
            <h1 className="text-3xl font-bold tracking-tight">My Posts</h1>
            <CurrentFolderBadge />
          </div>
          <div className="flex items-center gap-x-2">
            <CreateFolderDialog />
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
        </div>
        <p className="text-sm text-muted-foreground">
          A home for the content you want to keep close.
        </p>
      </header>

      <div className="flex items-center justify-between gap-2">
        <PostsFilter />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Folders</p>
        <FoldersList />
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Posts</p>
        <Posts />
      </div>
    </div>
  );
}
