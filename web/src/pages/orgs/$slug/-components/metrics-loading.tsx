import { Skeleton } from "@/components/ui/skeleton";

export function MetricsLoading() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border dark:bg-zinc-900/20 p-5 flex flex-col gap-3"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}
