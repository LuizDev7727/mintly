import { api } from "../api";

type GetMembersCountParams = {
  orgSlug: string;
};

export type GetMembersCountResponse = {
  count: number;
};

export async function getMembersCountHttp(
  params: GetMembersCountParams,
): Promise<GetMembersCountResponse> {
  const { orgSlug } = params;
  const { data } = await api.get<GetMembersCountResponse>(
    `/organizations/${orgSlug}/members/count`,
  );
  return data;
}
