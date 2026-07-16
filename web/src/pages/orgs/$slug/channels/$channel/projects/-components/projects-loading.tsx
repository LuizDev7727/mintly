import { Skeleton } from "@/components/ui/skeleton";

export function ProjectsLoading() {
  return (
    <div className="flex flex-wrap gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="w-75 overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="aspect-video w-full rounded-none" />

          <div className="p-3">
            <Skeleton className="mb-2.5 h-4 w-3/4" />

            <div className="mt-2.5 flex items-center gap-2">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
