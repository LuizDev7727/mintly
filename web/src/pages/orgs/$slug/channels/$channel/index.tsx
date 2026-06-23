import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  LayoutGrid,
  Plus,
  RotateCcw,
  Search,
  TextAlignJustify,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { PostCard } from "./-components/post-card";
import { Suspense } from "react";
import { FoldersList } from "./-components/folders-list";
import { CreateFolderDialog } from "./-components/create-folder-dialog";
import { BackToRootFolderButton } from "./-components/back-to-root-folder-button";
import { FolderListLoading } from "./-components/folder-list-loading";
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
            <button className="cursor-pointer px-2 py-1 bg-violet-500 rounded-md">
              <LayoutGrid className="size-3 dark:text-zinc-900" />
            </button>
            <button className="cursor-pointer px-2 py-1">
              <TextAlignJustify className="size-3 text-muted-foreground" />
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <BackToRootFolderButton />
            <Button variant={"outline"}>
              <ArrowLeft className="size-4" />
              Back to Folder name
            </Button>
          </div>
          <div className="flex items-center gap-x-1">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <Suspense fallback={<FolderListLoading />}>
          <FoldersList />
        </Suspense>
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-2 w-full">
          <div className="*:not-first:mt-2 w-full">
            <div className="relative w-full">
              <Input
                className="peer ps-9 w-full"
                id={"filter_name"}
                placeholder="Filter by Name"
                type="text"
              />
              <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Search aria-hidden="true" size={16} />
              </div>
            </div>
          </div>
          <Button>
            <RotateCcw className="size-4" />
            Reload
          </Button>
          <Button variant={"destructive"}>
            <X className="size-4" />
            Reset
          </Button>
          <Button variant={"outline"}>
            <Filter className="size-4" />
            Filter
          </Button>
        </div>
        <div className="bg-zinc-900 w-4 rotate-90 h-px" />
        <div className="flex items-center gap-x-2">
          <Button variant={"outline"} size={"icon"}>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button variant={"outline"} size={"icon"}>
            <ChevronLeft className="size-4" />
          </Button>
          <p className="text-muted-foreground">1/20</p>
          <Button variant={"outline"} size={"icon"}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant={"outline"} size={"icon"}>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
        <div className="bg-zinc-900 w-4 rotate-90 h-px" />
        <Button>
          <ArrowLeftRight className="size-4" />
          Move to folder
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        <PostCard />
        <PostCard />
        <PostCard />
        <PostCard />
        <PostCard />
        <PostCard />
        <PostCard />
        <PostCard />
        <PostCard />
        <PostCard />
      </div>
    </div>
  );
}
