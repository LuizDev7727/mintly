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

// TODO: mockado enquanto o billing via Polar está fora do ar.
const MOCK_PAYMENT_METHODS: GetPaymentMethodsResponse["paymentMethods"] = [
  {
    id: "pm_mock_1",
    brand: "visa",
    last4: "4242",
    expMonth: 11,
    expYear: 2030,
    isDefault: true,
  },
  {
    id: "pm_mock_2",
    brand: "mastercard",
    last4: "1123",
    expMonth: 4,
    expYear: 2028,
    isDefault: false,
  },
];

export async function getPaymentMethods({
  pageIndex,
}: GetPaymentMethodsParams): Promise<GetPaymentMethodsResponse> {
  return {
    paymentMethods: MOCK_PAYMENT_METHODS.slice(
      pageIndex * PAGE_SIZE,
      (pageIndex + 1) * PAGE_SIZE,
    ),
    meta: {
      totalCount: MOCK_PAYMENT_METHODS.length,
      totalPages: Math.ceil(MOCK_PAYMENT_METHODS.length / PAGE_SIZE),
    },
  };
}
