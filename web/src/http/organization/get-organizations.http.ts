import { api } from "../api";

export type GetOrganizationsResponse = {
  organizations: {
    id: string;
    name: string;
    slug: string;
    membersCount: number;
  }[];
};

export async function getOrganizationsHttp(): Promise<GetOrganizationsResponse> {
  const { data } = await api.get<GetOrganizationsResponse>(`/organizations`);
  return data;
}
