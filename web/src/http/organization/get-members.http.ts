import type { Member } from "@/types/member";
import { api } from "../api";

type GetMembersParams = {
  orgSlug: string;
  // Omitted = every member (sidebar avatars, owner filters).
  pageIndex?: number;
};

export type GetMembersResponse = {
  members: Member[];
  meta: {
    totalCount: number;
    totalPages: number;
  };
};

export async function getMembersHttp(
  params: GetMembersParams,
): Promise<GetMembersResponse> {
  const { orgSlug, pageIndex } = params;
  const { data } = await api.get<GetMembersResponse>(
    `/organizations/${orgSlug}/members`,
    { params: { pageIndex } },
  );
  return data;
}
