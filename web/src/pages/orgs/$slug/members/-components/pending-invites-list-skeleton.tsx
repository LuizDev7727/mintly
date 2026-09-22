import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the shape of PendingInviteMemberCard (avatar + name/email lines +
// the Revoke button) and of PendingInvitesPagination's bar, so the real
// content replaces this without a layout shift. The count matches the page
// size (see PAGE_SIZE in get-organization-pending-invites.ts).
const PLACEHOLDER_COUNT = 12;

function PendingInviteCardSkeleton() {
  return (
    <div className="w-80 space-y-2 rounded-md p-4 border">
      <div className="flex items-center gap-x-2">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Separator />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function PendingInvitesListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
          <PendingInviteCardSkeleton key={index} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-x-2">
        <Skeleton className="h-3 w-16" />
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
