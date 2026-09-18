import { useViewMode } from "@/context/view-mode-context";
import { LayoutGrid, TextAlignJustify } from "lucide-react";

export function SwitchViewMode() {
  const { view, setView } = useViewMode();

  const nextView = view === "grid" ? "list" : "grid";

  return (
    <button
      type="button"
      className="cursor-pointer"
      onClick={() => setView(nextView)}
    >
      {nextView === "grid" ? (
        <LayoutGrid className="size-3" />
      ) : (
        <TextAlignJustify className="size-3" />
      )}
    </button>
  );
}
