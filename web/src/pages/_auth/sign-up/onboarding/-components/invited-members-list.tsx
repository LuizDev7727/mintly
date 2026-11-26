import { Skeleton } from "@/components/ui/skeleton";
import { getOrganizationPendingInvitesHttp } from "@/http/organization/get-organization-pending-invites.http";
import { useQuery } from "@tanstack/react-query";
import { EmptyInvitedMembers } from "./empty-invited-members";
import { InvitedMemberRow } from "./invited-member-row";

type InvitedMembersListProps = {
  orgSlug: string;
};

export function InvitedMembersList({ orgSlug }: InvitedMembersListProps) {
  const { data, isPending } = useQuery({
    queryKey: ["onboarding-invites", orgSlug],
    queryFn: () => getOrganizationPendingInvitesHttp({ orgSlug, pageIndex: 0 }),
  });

  if (isPending) {
    return <Skeleton className="h-14 w-full" />;
  }

  const hasInvites = data !== undefined && data.pendingInvites.length > 0;

  if (!hasInvites) {
    return <EmptyInvitedMembers />;
  }

  return (
    <ul className="space-y-2">
      {data.pendingInvites.map((invite) => (
        <InvitedMemberRow key={invite.id} orgSlug={orgSlug} invite={invite} />
      ))}
    </ul>
  );
}
