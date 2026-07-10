import { api } from "../api";

type CreateInviteMemberParams = {
  orgSlug: string;
  email: string;
};

export type CreateInviteMemberResponse = {
  inviteId: string;
};

export async function createInviteMemberHttp(
  params: CreateInviteMemberParams,
): Promise<CreateInviteMemberResponse> {
  const { orgSlug, email } = params;
  const { data } = await api.post<CreateInviteMemberResponse>(
    `/organizations/${orgSlug}/invites`,
    { email },
  );
  return data;
}
