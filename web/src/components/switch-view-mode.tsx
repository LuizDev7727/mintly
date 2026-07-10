import { useViewMode } from "@/context/view-mode-context";
import { LayoutGrid, TextAlignJustify } from "lucide-react";

export function SwitchViewMode() {
  const { view, setView } = useViewMode();

  return (
    <div className="p-1 flex items-center bg-card rounded-[8px] border border-border">
      <button
        data-current={view === "grid"}
        className="cursor-pointer px-2 py-1 data-[current=true]:bg-primary rounded-md"
        onClick={() => setView("grid")}
      >
        <LayoutGrid
          data-current={view === "grid"}
          className="size-3 text-muted-foreground data-[current=true]:text-black"
        />
      </button>
      <button
        data-current={view === "list"}
        className="cursor-pointer px-2 py-1 data-[current=true]:bg-primary rounded-md"
        onClick={() => setView("list")}
      >
        <TextAlignJustify
          data-current={view === "list"}
          className="size-3 text-muted-foreground data-[current=true]:text-black"
        />
      </button>
    </div>
  );
}
