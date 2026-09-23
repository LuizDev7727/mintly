import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { parseAsInteger, useQueryState } from "nuqs";
import { getOrganizationPendingInvitesHttp } from "@/http/organization/get-organization-pending-invites.http";
import { EmptyPendingInvites } from "./empty-pending-invites";
import { PendingInviteMemberCard } from "./pending-invite-member-card";
import { PendingInvitesPagination } from "./pending-invites-pagination";

export function PendingInvitesList() {
  const { slug } = useParams({ from: "/orgs/$slug" });

  const [currentPage] = useQueryState(
    "invites_page",
    parseAsInteger.withDefault(0),
  );

  // useSuspenseQuery re-suspends on every queryKey change (it does not accept
  // placeholderData), so changing pages shows the Suspense fallback again —
  // see PendingInvitesListLoading, rendered by the boundary in members-tabs.tsx.
  const { data } = useSuspenseQuery({
    queryKey: ["organization-pending-invites", slug, "page", currentPage],
    queryFn: () =>
      getOrganizationPendingInvitesHttp({
        orgSlug: slug,
        pageIndex: currentPage,
      }),
  });

  // Only the first page shows the empty-state illustration: a later page with
  // no items just means the total shrank (e.g. an invite was accepted) while
  // the user was on it, not that there are no invites at all.
  if (data.pendingInvites.length === 0 && currentPage === 0) {
    return <EmptyPendingInvites />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {data.pendingInvites.map((invite) => (
          <PendingInviteMemberCard key={invite.id} inviteMember={invite} />
        ))}
      </div>

      <PendingInvitesPagination
        totalPages={data.meta.totalPages}
        totalCount={data.meta.totalCount}
      />
    </div>
  );
}
