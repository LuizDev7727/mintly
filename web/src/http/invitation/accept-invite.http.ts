import { api } from "../api";

type AcceptInviteParams = {
  inviteId: string;
};

export async function acceptInviteHttp(
  params: AcceptInviteParams,
): Promise<void> {
  const { inviteId } = params;
  await api.post(`/invitations/${inviteId}/accept`);
}
