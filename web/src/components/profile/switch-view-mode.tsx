import { cn } from "@/lib/utils";
import { useViewMode } from "@/context/view-mode-context";

type ViewMode = "grid" | "list";

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "grid", label: "Grid view" },
  { value: "list", label: "List view" },
];

function MiniPostCard() {
  return (
    <div className="space-y-1 rounded-sm border border-border bg-card p-1">
      <div className="aspect-video rounded-[2px] bg-muted" />
      <div className="h-1 w-3/4 rounded-full bg-muted-foreground/40" />
    </div>
  );
}

function MiniPostRow() {
  return (
    <div className="flex items-center gap-1 rounded-sm border border-border bg-card p-1">
      <div className="aspect-square size-4 shrink-0 rounded-[2px] bg-muted" />
      <div className="h-1 flex-1 rounded-full bg-muted-foreground/40" />
    </div>
  );
}

function GridPreview() {
  return (
    <div className="grid h-full grid-cols-2 content-center gap-1 rounded-sm bg-background p-1.5">
      {Array.from({ length: 4 }).map((_, index) => (
        <MiniPostCard key={index} />
      ))}
    </div>
  );
}

function ListPreview() {
  return (
    <div className="flex h-full flex-col justify-center gap-1 rounded-sm bg-background p-1.5 px-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <MiniPostRow key={index} />
      ))}
    </div>
  );
}

export function SwitchViewMode() {
  const { view, setView } = useViewMode();

  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <p className="text-sm font-medium">Display preference</p>
        <p className="text-sm text-muted-foreground">
          Switch between grid and list views.
        </p>
      </div>

      <div className="flex gap-3">
        {VIEW_OPTIONS.map((option) => {
          const isSelected = view === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setView(option.value)}
              className="flex flex-col items-center gap-2"
            >
              <div
                data-selected={isSelected}
                className={cn(
                  "h-24 w-28 rounded-lg border border-border bg-card p-1.5 transition-colors",
                  "data-[selected=true]:border-primary",
                )}
              >
                {option.value === "grid" ? <GridPreview /> : <ListPreview />}
              </div>

              <span
                data-selected={isSelected}
                className="text-xs font-medium text-muted-foreground data-[selected=true]:text-foreground"
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
