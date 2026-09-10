import { polar } from "@/lib/polar.ts";

type GetPaymentMethodsParams = {
  organizationSlug: string;
  pageIndex: number;
};

type GetPaymentMethodsResponse = {
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

const PAGE_SIZE = 10;

export async function getPaymentMethods({
  organizationSlug,
  pageIndex,
}: GetPaymentMethodsParams): Promise<GetPaymentMethodsResponse> {
  const { result } = await polar.customers.listPaymentMethodsExternal({
    externalId: organizationSlug,
    // Polar pages are 1-indexed; the rest of the app uses 0-indexed pages.
    page: pageIndex + 1,
    limit: PAGE_SIZE,
  });

  // PaymentMethod is a union of card and generic (non-card) processors.
  // Only card methods carry `methodMetadata` (brand/last4/expiry), which is
  // all this app currently shows, so non-card methods are skipped.
  const paymentMethods = result.items.flatMap((item) => {
    if (!("methodMetadata" in item)) {
      return [];
    }

    return [
      {
        id: item.id,
        brand: item.methodMetadata.brand,
        last4: item.methodMetadata.last4,
        expMonth: item.methodMetadata.expMonth,
        expYear: item.methodMetadata.expYear,
        isDefault: item.isDefault,
      },
    ];
  });

  return {
    paymentMethods,
    meta: {
      totalCount: result.pagination.totalCount,
      totalPages: result.pagination.maxPage,
    },
  };
}
