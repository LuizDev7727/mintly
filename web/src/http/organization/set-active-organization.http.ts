import { api } from "../api";

type SetActiveOrganizationParams = {
  organizationSlug: string;
};

export async function setActiveOrganizationHttp(
  params: SetActiveOrganizationParams,
): Promise<void> {
  const { organizationSlug } = params;
  await api.put("/organization/active", { organizationSlug });
}
