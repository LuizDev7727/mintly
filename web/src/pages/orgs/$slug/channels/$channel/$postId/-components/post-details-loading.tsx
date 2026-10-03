import { Skeleton } from "@/components/ui/skeleton";

export function PostDetailsLoading() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-6">
        <div className="space-y-2 rounded-xl border border-border px-4 pt-2.5 pb-4">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-5 w-72" />
        </div>

        <div className="space-y-2 rounded-xl border border-border px-4 pt-2.5 pb-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>

      <div className="min-w-0 space-y-6">
        <div className="overflow-hidden rounded-xl border border-border">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
