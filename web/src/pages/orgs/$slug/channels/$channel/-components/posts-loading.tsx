import { Skeleton } from "@/components/ui/skeleton";

export function PostsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-sidebar p-2.5 text-card-foreground"
        >
          <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
            <Skeleton className="h-full w-full rounded-none" />
            <Skeleton className="absolute left-2 top-2 h-5 w-20 rounded-full" />
            <Skeleton className="absolute bottom-1.5 right-1.5 h-4 w-10 rounded" />
          </div>

          <div className="flex items-start gap-2.5 pt-2.5">
            <div className="flex -space-x-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <Skeleton
                  key={j}
                  className="size-6 shrink-0 rounded-full ring-2 ring-sidebar"
                />
              ))}
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>

            <Skeleton className="size-6 shrink-0 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
