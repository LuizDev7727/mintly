import { api } from "../api";

type UpdateOrganizationParams = {
  slug: string;
  name: string;
  avatarKey: string | null;
};

export async function updateOrganizationHttp(
  params: UpdateOrganizationParams,
): Promise<void> {
  const { slug, name, avatarKey } = params;
  await api.put(`/organizations/${slug}`, { name, avatarKey });
}
