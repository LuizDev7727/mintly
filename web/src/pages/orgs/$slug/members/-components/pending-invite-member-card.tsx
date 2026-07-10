import type { PendingInvite } from "@/types/pending-invite";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { dayjs } from "@/lib/dayjs";
import { revokeInviteHttp } from "@/http/organization/revoke-invite.http";
import type { GetMembersResponse } from "@/http/organization/get-members.http";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Clock, Mail, UserRoundX } from "lucide-react";

type PendingInviteMemberCardProps = {
  inviteMember: PendingInvite;
};

export function PendingInviteMemberCard({
  inviteMember,
}: PendingInviteMemberCardProps) {
  const { slug } = useParams({ from: "/orgs/$slug" });
  const queryClient = useQueryClient();

  const { mutate: handleRevoke, isPending } = useMutation({
    mutationFn: revokeInviteHttp,
    onSuccess: () => {
      queryClient.setQueryData<GetMembersResponse>(
        ["members", slug],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pendingInvites: old.pendingInvites.filter(
              (invite) => invite.id !== inviteMember.id,
            ),
          };
        },
      );
    },
  });

  return (
    <div className="w-80 space-y-2 rounded-md p-4 border">
      <div className="flex items-center gap-x-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <Mail className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-x-2">
            <p className="truncate text-sm font-semibold leading-tight text-foreground">
              {inviteMember.email}
            </p>
            {inviteMember.role && (
              <Badge variant="outline" className="capitalize">
                {inviteMember.role}
              </Badge>
            )}
          </div>
          <div className="flex mt-0.5 items-center text-xs text-muted-foreground gap-x-0.5">
            <Clock className="size-3 shrink-0" />
            <span>Invited {dayjs(inviteMember.createdAt).fromNow()}</span>
          </div>
        </div>
      </div>
      <Separator />
      <Button
        className="w-full"
        size="sm"
        variant="destructive"
        disabled={isPending}
        onClick={() =>
          handleRevoke({ orgSlug: slug, inviteId: inviteMember.id })
        }
      >
        {isPending ? <Spinner /> : <UserRoundX className="size-3" />}
        Revoke Invite
      </Button>
    </div>
  );
}
