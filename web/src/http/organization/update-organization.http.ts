import { api } from "../api";

type UpdateOrganizationParams = {
  slug: string;
  name: string;
};

export async function updateOrganizationHttp(
  params: UpdateOrganizationParams,
): Promise<void> {
  const { slug, name } = params;
  await api.put(`/organizations/${slug}`, { name });
}
