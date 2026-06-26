import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutGrid, Plus, TextAlignJustify } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { FoldersList } from "./-components/folders-list";
import { CreateFolderDialog } from "./-components/create-folder-dialog";
import { CurrentFolderBadge } from "./-components/current-folder-badge";
import { PostsList } from "./-components/posts-list";

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
  const [view, setView] = useState<"grid" | "list">("grid");

  const { slug, channel } = Route.useParams();

  function handleViewChange(newView: "grid" | "list") {
    setView(newView);
  }
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <h1 className="text-xl font-semibold">My Posts</h1>
          <CurrentFolderBadge />
        </div>
        <div className="flex items-center gap-x-2">
          <CreateFolderDialog />
          <div className="bg-zinc-900 w-4 rotate-90 h-px" />
          <div className="p-2 flex items-center bg-card rounded-[8px] border border-border">
            <button
              data-current={view === "grid"}
              className="cursor-pointer px-2 py-1 data-[current=true]:bg-violet-500 rounded-md"
              onClick={() => handleViewChange("grid")}
            >
              <LayoutGrid
                data-current={view === "grid"}
                className="size-3 text-muted-foreground data-[current=true]:text-black"
              />
            </button>
            <button
              data-current={view === "list"}
              className="cursor-pointer px-2 py-1 data-[current=true]:bg-violet-500 rounded-md"
              onClick={() => handleViewChange("list")}
            >
              <TextAlignJustify
                data-current={view === "list"}
                className="size-3 text-muted-foreground data-[current=true]:text-black"
              />
            </button>
          </div>
          <div className="bg-zinc-900 w-4 rotate-90 h-px" />
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

      <PostsList />
    </div>
  );
}
