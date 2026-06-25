import { Badge } from "@/components/ui/badge";
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
  FolderPlus,
  FolderRoot,
  LayoutGrid,
  Plus,
  RotateCcw,
  Search,
  TextAlignJustify,
  X,
} from "lucide-react";
import { FolderCard } from "./-components/folder-card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { PostCard } from "./-components/post-card";

export const Route = createFileRoute("/orgs/$slug/channels/$channel/")({
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
          <Badge>Default</Badge>
        </div>
        <div className="flex items-center gap-x-2">
          <Button variant={"outline"}>
            <FolderPlus className="mr-2 size-4" />
            New Folder
          </Button>
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <Button variant={"outline"}>
              <FolderRoot className="size-4" />
              Back to Root
            </Button>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          <FolderCard />
          <FolderCard />
          <FolderCard />
          <FolderCard />
          <FolderCard />
          <FolderCard />
          <FolderCard />
          <FolderCard />
        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <PostCard
          post={{
            id: "20390239023",
            thumbnailUrl:
              "https://i.ytimg.com/vi/i0WexQJ3UeI/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCAGUH3VSDFqOlrVPYgExUdyQF08Q",
            title: "Dei um presente para o Toguro",
            size: 1000,
            status: "PROCESSING",
            type: "image/png",
            duration: 1230239,
            publishAt: null,
            socialsToPost: [
              {
                id: "3df6f75f-6d80-4cb0-a411-9af693b8af6c",
                name: "Cristiano Ronaldo",
                social: "YOUTUBE",
              },
              {
                id: "ad9dc65f-bf36-4505-b3cc-2db39bcae004",
                name: "John Doe",
                social: "TIKTOK",
              },
            ],
            author: { name: "John Doe", avatarUrl: null },
          }}
        />

        <PostCard
          post={{
            id: "20390239023",
            thumbnailUrl:
              "https://i.ytimg.com/vi/xb9qDT40mb0/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDfe3eyoNSFd83kD24Q1cWHnhSg9w",
            title: "Assisti o jogo da seleção na cidade mais doida do Brasil",
            size: 1000,
            status: "PUBLISHED",
            type: "image/png",
            duration: 1230239,
            publishAt: null,
            socialsToPost: [
              {
                id: "3df6f75f-6d80-4cb0-a411-9af693b8af6c",
                name: "Cristiano Ronaldo",
                social: "YOUTUBE",
              },
              {
                id: "ad9dc65f-bf36-4505-b3cc-2db39bcae004",
                name: "John Doe",
                social: "TIKTOK",
              },
            ],
            author: { name: "John Doe", avatarUrl: null },
          }}
        />

        <PostCard
          post={{
            id: "20390239023",
            thumbnailUrl:
              "https://i.ytimg.com/vi/xb9qDT40mb0/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDfe3eyoNSFd83kD24Q1cWHnhSg9w",
            title: "Assisti o jogo da seleção na cidade mais doida do Brasil",
            size: 1000,
            status: "ERROR",
            type: "image/png",
            duration: 1230239,
            publishAt: null,
            socialsToPost: [
              {
                id: "3df6f75f-6d80-4cb0-a411-9af693b8af6c",
                name: "Cristiano Ronaldo",
                social: "YOUTUBE",
              },
              {
                id: "ad9dc65f-bf36-4505-b3cc-2db39bcae004",
                name: "John Doe",
                social: "TIKTOK",
              },
            ],
            author: { name: "John Doe", avatarUrl: null },
          }}
        />

        <PostCard
          post={{
            id: "20390239023",
            thumbnailUrl:
              "https://i.ytimg.com/vi/xb9qDT40mb0/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDfe3eyoNSFd83kD24Q1cWHnhSg9w",
            title: "Assisti o jogo da seleção na cidade mais doida do Brasil",
            size: 1000,
            status: "SCHEDULED",
            type: "image/png",
            duration: 1230239,
            publishAt: null,
            socialsToPost: [
              {
                id: "3df6f75f-6d80-4cb0-a411-9af693b8af6c",
                name: "Cristiano Ronaldo",
                social: "YOUTUBE",
              },
              {
                id: "ad9dc65f-bf36-4505-b3cc-2db39bcae004",
                name: "John Doe",
                social: "TIKTOK",
              },
            ],
            author: { name: "John Doe", avatarUrl: null },
          }}
        />
      </div>
    </div>
  );
}
