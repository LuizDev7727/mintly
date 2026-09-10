import { api } from "../api";

type GetInvoicesParams = {
  orgSlug: string;
  pageIndex: number;
};

export type GetInvoicesResponse = {
  invoices: {
    id: string;
    createdAt: string;
    totalAmount: number;
    currency: string;
    status: string;
  }[];
  meta: {
    totalCount: number;
    totalPages: number;
  };
};

export async function getInvoicesHttp(
  params: GetInvoicesParams,
): Promise<GetInvoicesResponse> {
  const { orgSlug, pageIndex } = params;
  const { data } = await api.get<GetInvoicesResponse>(
    `/organizations/${orgSlug}/billing/invoices`,
    { params: { pageIndex } },
  );
  return data;
}
