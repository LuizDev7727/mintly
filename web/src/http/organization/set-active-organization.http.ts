import { api } from "../api";

type SetActiveOrganizationParams = {
  organizationId: string;
};

export async function setActiveOrganizationHttp(
  params: SetActiveOrganizationParams,
): Promise<void> {
  const { organizationId } = params;
  await api.put("/organization/active", { organizationId });
}
