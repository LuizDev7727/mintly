import type { Member } from "@/types/member";
import type { PendingInvite } from "@/types/pending-invite";
import { api } from "../api";

type GetMembersParams = {
  orgSlug: string;
};

export type GetMembersResponse = {
  members: Member[];
  pendingInvites: PendingInvite[];
};

export async function getMembersHttp(
  params: GetMembersParams,
): Promise<GetMembersResponse> {
  const { orgSlug } = params;
  const { data } = await api.get<GetMembersResponse>(
    `/organizations/${orgSlug}/members`,
  );
  return data;
}
