import { Skeleton } from "@/components/ui/skeleton";

function FolderCardSkeleton() {
  return (
    <div className="flex items-center gap-x-3 rounded-lg border border-border p-3">
      <Skeleton className="shrink-0 size-8 rounded-md" />

      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>

      <Skeleton className="shrink-0 size-4 rounded-sm" />
    </div>
  );
}

export function FolderListLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <FolderCardSkeleton key={i} />
      ))}
    </div>
  );
}
