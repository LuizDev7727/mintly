import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Search, X } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import type { ChangeEvent } from "react";

export function PostsFilter() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });
  const queryClient = useQueryClient();

  const [title, setTitle] = useQueryState(
    "title_filter",
    parseAsString.withDefault(""),
  );

  function handleReload() {
    queryClient.invalidateQueries({
      queryKey: ["posts", slug, channel],
    });
  }

  function handleResetFilters() {
    setTitle("");
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
  }

  const isFiltersEmpty = title.length === 0;

  return (
    <div className="flex items-center gap-x-2 w-full">
      <div className="*:not-first:mt-2 w-full">
        <div className="relative w-full">
          <Input
            className="peer ps-9 w-full"
            id={"filter_name"}
            placeholder="Filter by Name"
            value={title}
            type="text"
            onChange={handleTitleChange}
          />
          <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <Search aria-hidden="true" size={16} />
          </div>
        </div>
      </div>
      <Button onClick={handleReload}>
        <RotateCcw className="size-4" />
        Reload
      </Button>
      <Button
        onClick={handleResetFilters}
        disabled={isFiltersEmpty}
        variant={"destructive"}
      >
        <X className="size-4" />
        Reset
      </Button>
    </div>
  );
}
