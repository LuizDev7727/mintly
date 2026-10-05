import { api } from "../api";

type GetInvoiceParams = {
  orgSlug: string;
  invoiceId: string;
};

export type GetInvoiceResponse = {
  invoice: {
    id: string;
    status: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
    dueAt: string;
    orderId: string;
    customerId: string;
    billingReason: string;
    subscriptionId: string;
    productId: string;
    billing: {
      companyName: string;
      taxId: string;
      address: string[];
    };
    amounts: {
      subtotal: number;
      discount: number;
      net: number;
      tax: number;
      total: number;
      appliedBalance: number;
      due: number;
      refunded: number;
    };
    items: {
      description: string;
      detail: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[];
  };
};

export async function getInvoiceHttp(
  params: GetInvoiceParams,
): Promise<GetInvoiceResponse> {
  const { orgSlug, invoiceId } = params;
  const { data } = await api.get<GetInvoiceResponse>(
    `/organizations/${orgSlug}/billing/invoices/${invoiceId}`,
  );
  return data;
}
