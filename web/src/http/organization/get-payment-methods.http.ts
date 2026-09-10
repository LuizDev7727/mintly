import { api } from "../api";

type GetPaymentMethodsParams = {
  orgSlug: string;
  pageIndex: number;
};

export type GetPaymentMethodsResponse = {
  paymentMethods: {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    isDefault: boolean;
  }[];
  meta: {
    totalCount: number;
    totalPages: number;
  };
};

export async function getPaymentMethodsHttp(
  params: GetPaymentMethodsParams,
): Promise<GetPaymentMethodsResponse> {
  const { orgSlug, pageIndex } = params;
  const { data } = await api.get<GetPaymentMethodsResponse>(
    `/organizations/${orgSlug}/billing/payment-methods`,
    { params: { pageIndex } },
  );
  return data;
}
