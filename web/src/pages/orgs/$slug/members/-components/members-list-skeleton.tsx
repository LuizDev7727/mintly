import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the shape of MemberCard (avatar + name line + email line) and of
// MembersPagination's bar, so the real content replaces this without a layout
// shift. The count matches the page size (see PAGE_SIZE in get-members.ts).
const PLACEHOLDER_COUNT = 12;

function MemberCardSkeleton() {
  return (
    <div className="w-90 rounded-md p-4 border">
      <div className="flex items-start gap-x-2">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    </div>
  );
}

export function MembersListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
          <MemberCardSkeleton key={index} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-x-2">
        <Skeleton className="h-3 w-20" />
        <div className="flex items-center gap-x-2">
          <Skeleton className="size-9" />
          <Skeleton className="size-9" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="size-9" />
          <Skeleton className="size-9" />
        </div>
      </div>
    </div>
  );
}
