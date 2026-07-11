import { Skeleton } from "@/components/ui/skeleton";

export function ActivitiesListLoading() {
  const itemsCount = 6;

  return (
    <div className="space-y-6">
      {Array.from({ length: itemsCount }).map((_, index) => (
        <div key={index} className="ml-10 flex gap-3">
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
