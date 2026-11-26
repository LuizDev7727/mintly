import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { revokeInviteHttp } from "@/http/organization/revoke-invite.http";
import type { PendingInvite } from "@/types/pending-invite";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

type InvitedMemberRowProps = {
  orgSlug: string;
  invite: PendingInvite;
};

export function InvitedMemberRow({ orgSlug, invite }: InvitedMemberRowProps) {
  const queryClient = useQueryClient();

  // Invitees are not users yet, so there is no avatarUrl: use the e-mail initials.
  const initials = invite.email.slice(0, 2).toUpperCase();

  const { mutate: handleRevokeInvite, isPending } = useMutation({
    mutationFn: revokeInviteHttp,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["onboarding-invites", orgSlug],
      });
    },
  });

  return (
    <li className="flex items-center gap-3 rounded-lg border p-3">
      <Avatar>
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1 truncate text-sm">{invite.email}</span>
      <Badge variant="processing">Pending</Badge>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove invite for ${invite.email}`}
        disabled={isPending}
        onClick={() => handleRevokeInvite({ orgSlug, inviteId: invite.id })}
      >
        <X className="size-4" />
      </Button>
    </li>
  );
}
