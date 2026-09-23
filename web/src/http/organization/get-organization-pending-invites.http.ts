import type { PendingInvite } from "@/types/pending-invite";
import { api } from "../api";

type GetOrganizationPendingInvitesParams = {
  orgSlug: string;
  pageIndex: number;
};

export type GetOrganizationPendingInvitesResponse = {
  pendingInvites: PendingInvite[];
  meta: {
    totalCount: number;
    totalPages: number;
  };
};

export async function getOrganizationPendingInvitesHttp(
  params: GetOrganizationPendingInvitesParams,
): Promise<GetOrganizationPendingInvitesResponse> {
  const { orgSlug, pageIndex } = params;
  const { data } = await api.get<GetOrganizationPendingInvitesResponse>(
    `/organizations/${orgSlug}/invites/pending`,
    { params: { pageIndex } },
  );
  return data;
}
