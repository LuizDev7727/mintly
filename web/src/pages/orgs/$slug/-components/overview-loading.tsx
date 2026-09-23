import { Skeleton } from "@/components/ui/skeleton";

export function OverviewLoading() {
  return (
    <div className="space-y-4 h-full">
      <div className="space-y-2">
        <h1 className="text-xl font-medium">Overview</h1>
        <p className="text-sm">Here's what's hapenning with your organization today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border dark:bg-zinc-900/20 p-5 flex flex-col gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-12" />
        </div>
        <div className="rounded-lg border dark:bg-zinc-900/20 p-5 flex flex-col gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-12" />
        </div>
        <div className="rounded-lg border dark:bg-zinc-900/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="rounded-lg border dark:bg-zinc-900/20 overflow-hidden">
          <div className="px-5 pt-5 pb-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-12 w-full rounded-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-lg border dark:bg-zinc-900/20 p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border dark:bg-zinc-900/20 p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="ml-10 flex gap-3">
                <Skeleton className="size-6 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
