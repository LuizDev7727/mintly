import { Skeleton } from "@/components/ui/skeleton"

export function WebhookDetailsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />

      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>

        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        <Skeleton className="h-px w-full" />

        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>

        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
