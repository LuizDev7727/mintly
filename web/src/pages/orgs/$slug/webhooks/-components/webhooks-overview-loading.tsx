import { Skeleton } from "@/components/ui/skeleton"

export function WebhooksOverviewLoading() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
          >
            <Skeleton className="size-8 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-8 w-32" />
            </div>

            <div className="rounded-md border divide-y">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-3">
                  <Skeleton className="size-2 shrink-0 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-5 w-12 shrink-0" />
                  <Skeleton className="h-4 w-16 shrink-0" />
                </div>
              ))}
            </div>

            <Skeleton className="h-8 w-full" />
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-48" />
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-full" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-28" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="size-7" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
