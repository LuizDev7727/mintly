import { Skeleton } from "@/components/ui/skeleton";

export function ChannelsListLoading() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="min-w-0 w-full rounded-md border border-border bg-transparent">
          <header className="p-4 flex items-center justify-between gap-x-2">
            <div className="flex gap-x-2">
              <div className="flex items-center justify-center p-2 rounded-md border">
                <Skeleton className="size-4" />
              </div>
              <div>
                <Skeleton className="h-[15px] w-32" />
                <div className="mt-1 flex items-center gap-2.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
            <Skeleton className="h-9 w-28 shrink-0 rounded-md" />
          </header>

          <div className="h-32 w-full flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Fetching chart data...</span>
          </div>

          <footer className="p-4 border border-transparent border-t-border flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </footer>
        </div>
      ))}
    </div>
  );
}
