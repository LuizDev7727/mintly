import { api } from "../api";

type DeclineInviteParams = {
  inviteId: string;
};

export async function declineInviteHttp(
  params: DeclineInviteParams,
): Promise<void> {
  const { inviteId } = params;
  await api.post(`/invitations/${inviteId}/decline`);
}
