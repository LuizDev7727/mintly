import { api } from "../api";

export type GetActiveOrganizationResponse = {
  organization: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    billingEmail: string;
    membersCount: number;
  };
};

export async function getActiveOrganizationHttp(): Promise<GetActiveOrganizationResponse> {
  const { data } = await api.get<GetActiveOrganizationResponse>(
    "/organization/active",
  );
  return data;
}
