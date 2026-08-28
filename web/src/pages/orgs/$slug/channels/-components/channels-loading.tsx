import { Skeleton } from "@/components/ui/skeleton";

export function ChannelsLoading() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-lg border dark:bg-zinc-900/20"
        >
          <div className="flex items-start justify-between gap-2 px-5 pt-5">
            <div className="min-w-0 space-y-1.5">
              <Skeleton className="h-4.5 w-28" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <Skeleton className="size-8 shrink-0 rounded-md" />
          </div>

          <Skeleton className="mt-4 h-18 w-full rounded-none" />

          <div className="flex items-center justify-between gap-2 border-t px-5 py-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </div>
      ))}
    </>
  );
}
