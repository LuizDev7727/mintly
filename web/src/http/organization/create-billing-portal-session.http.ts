import { api } from "../api";

type CreateBillingPortalSessionParams = {
  orgSlug: string;
};

export type CreateBillingPortalSessionResponse = {
  portalUrl: string;
};

export async function createBillingPortalSessionHttp(
  params: CreateBillingPortalSessionParams,
): Promise<CreateBillingPortalSessionResponse> {
  const { orgSlug } = params;
  const { data } = await api.post<CreateBillingPortalSessionResponse>(
    `/organizations/${orgSlug}/billing/portal-session`,
  );
  return data;
}
