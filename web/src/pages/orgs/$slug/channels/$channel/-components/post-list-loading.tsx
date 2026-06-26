import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

function PostCardSkeleton() {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-input p-4">
      {/* thumbnail */}
      <Skeleton className="mb-3 h-37.5 w-full rounded-[10px]" />

      {/* title */}
      <Skeleton className="mb-2.5 h-4 w-3/4" />

      {/* badge row */}
      <div className="mb-3.5 flex h-7 items-center gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      {/* size + duration */}
      <div className="mb-3 grid grid-cols-2 gap-2.5">
        <div className="py-2">
          <Skeleton className="mb-1 h-3 w-10" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="py-2">
          <Skeleton className="mb-1 h-3 w-14" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>

      <Separator />

      {/* publish at + socials */}
      <div className="mb-3.5 pt-3">
        <div className="mb-2.5 flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="mb-2.5 flex items-center justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex h-24 flex-col gap-1.5">
          <Skeleton className="h-9 w-full rounded-[10px]" />
          <Skeleton className="h-9 w-full rounded-[10px]" />
        </div>
      </div>

      <Separator />

      {/* footer */}
      <div className="flex items-center justify-between pt-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}

export function PostListLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
