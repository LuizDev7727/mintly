import { api } from "../api";

type CreateOrganizationParams = {
  name: string;
  slug: string;
};

type CreateOrganizationResponse = {
  organizationId: string;
};

export async function createOrganizationHttp(
  params: CreateOrganizationParams,
): Promise<CreateOrganizationResponse> {
  const { data } = await api.post<CreateOrganizationResponse>(
    `/organizations`,
    {
      name: params.name,
      slug: params.slug,
    },
  );
  return {
    organizationId: data.organizationId,
  };
}
