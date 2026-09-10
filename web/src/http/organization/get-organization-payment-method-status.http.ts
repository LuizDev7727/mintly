import { api } from "../api";

type GetOrganizationPaymentMethodStatusParams = {
  orgSlug: string;
};

export type GetOrganizationPaymentMethodStatusResponse = {
  hasOrganizationPaymentMethod: boolean;
};

export async function getOrganizationPaymentMethodStatusHttp(
  params: GetOrganizationPaymentMethodStatusParams,
): Promise<GetOrganizationPaymentMethodStatusResponse> {
  const { orgSlug } = params;
  const { data } = await api.get<GetOrganizationPaymentMethodStatusResponse>(
    `/organizations/${orgSlug}/billing/payment-method`,
  );
  return data;
}
