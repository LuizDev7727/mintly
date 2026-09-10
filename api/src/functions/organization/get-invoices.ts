import { polar } from "@/lib/polar.ts";

type GetInvoicesParams = {
  organizationSlug: string;
  pageIndex: number;
};

type GetInvoicesResponse = {
  invoices: {
    id: string;
    createdAt: Date;
    totalAmount: number;
    currency: string;
    status: string;
  }[];
  meta: {
    totalCount: number;
    totalPages: number;
  };
};

const PAGE_SIZE = 10;

export async function getInvoices({
  organizationSlug,
  pageIndex,
}: GetInvoicesParams): Promise<GetInvoicesResponse> {
  const { result } = await polar.orders.list({
    externalCustomerId: organizationSlug,
    // Polar pages are 1-indexed; the rest of the app uses 0-indexed pages.
    page: pageIndex + 1,
    limit: PAGE_SIZE,
    sorting: ["-created_at"],
  });

  const invoices = result.items.map((order) => ({
    id: order.id,
    createdAt: order.createdAt,
    totalAmount: order.totalAmount,
    currency: order.currency,
    status: order.status,
  }));

  return {
    invoices,
    meta: {
      totalCount: result.pagination.totalCount,
      totalPages: result.pagination.maxPage,
    },
  };
}
