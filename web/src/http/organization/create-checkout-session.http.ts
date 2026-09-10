import { api } from "../api";

type CreateCheckoutSessionParams = {
  orgSlug: string;
};

export type CreateCheckoutSessionResponse = {
  checkoutUrl: string;
};

export async function createCheckoutSessionHttp(
  params: CreateCheckoutSessionParams,
): Promise<CreateCheckoutSessionResponse> {
  const { orgSlug } = params;
  const { data } = await api.post<CreateCheckoutSessionResponse>(
    `/organizations/${orgSlug}/billing/checkout-session`,
  );
  return data;
}
