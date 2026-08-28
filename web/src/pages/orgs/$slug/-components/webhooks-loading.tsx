import { Skeleton } from "@/components/ui/skeleton";

export function WebhooksLoading() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-12" />
      </div>

      <div className="flex items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 rounded-md border px-3 py-2.5">
            <Skeleton className="size-3.5 shrink-0 rounded-full" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
            <Skeleton className="size-6 shrink-0 rounded-md" />
          </div>
        ))}
      </div>

      <Skeleton className="h-8 w-full" />
    </div>
  );
}
