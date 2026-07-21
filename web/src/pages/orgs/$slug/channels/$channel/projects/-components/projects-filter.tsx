import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useQueryState, debounce } from "nuqs";

export function ProjectsFilter() {
  const [titleFilter, setTitleFilter] = useQueryState("title_filter", {
    defaultValue: "",
  });

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    setTitleFilter(value, {
      limitUrlUpdates: value !== "" ? debounce(500) : undefined,
    });
  }

  function handleResetFilter() {
    setTitleFilter("");
  }

  const isFilterEmpty = titleFilter.length === 0;

  return (
    <div className="flex items-center gap-x-2 flex-1">
      <div className="relative w-full">
        <Input
          className="peer ps-9"
          placeholder="Filter by name"
          type="search"
          value={titleFilter}
          onChange={handleInputChange}
        />
        <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <Search size={16} />
        </div>
      </div>
      <Button
        disabled={isFilterEmpty}
        onClick={handleResetFilter}
        variant={"destructive"}
      >
        <X className="size-4" />
        Reset
      </Button>
    </div>
  );
}
