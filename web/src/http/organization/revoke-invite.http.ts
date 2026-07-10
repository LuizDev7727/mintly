import { api } from "../api";

type RevokeInviteParams = {
  orgSlug: string;
  inviteId: string;
};

export async function revokeInviteHttp(
  params: RevokeInviteParams,
): Promise<void> {
  const { orgSlug, inviteId } = params;
  await api.delete(`/organizations/${orgSlug}/invites/${inviteId}`);
}
