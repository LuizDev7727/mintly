import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = 5;

export function VideosLoading() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <ul className="divide-y">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <li key={index} className="flex items-center gap-4 p-4">
            <Skeleton className="size-10 shrink-0" />

            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-48 max-w-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
