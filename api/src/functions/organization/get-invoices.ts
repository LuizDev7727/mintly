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

// TODO: mockado enquanto o billing via Polar está fora do ar.
export const MOCK_INVOICES: GetInvoicesResponse["invoices"] = [
  { id: "INV-2026-001", createdAt: new Date("2026-09-28T12:00:00Z"), totalAmount: 875, currency: "usd", status: "paid" },
  { id: "INV-2026-002", createdAt: new Date("2026-09-21T12:00:00Z"), totalAmount: 1599, currency: "usd", status: "paid" },
  { id: "INV-2026-003", createdAt: new Date("2026-09-14T15:00:00Z"), totalAmount: 28510, currency: "usd", status: "pending" },
  { id: "INV-2026-004", createdAt: new Date("2026-09-07T12:00:00Z"), totalAmount: 7999, currency: "usd", status: "void" },
  { id: "INV-2026-005", createdAt: new Date("2026-08-31T12:00:00Z"), totalAmount: 4200, currency: "usd", status: "draft" },
  { id: "INV-2026-006", createdAt: new Date("2026-08-24T12:00:00Z"), totalAmount: 12000, currency: "usd", status: "refunded" },
  { id: "INV-2026-007", createdAt: new Date("2026-08-17T12:00:00Z"), totalAmount: 6350, currency: "usd", status: "partially_refunded" },
  { id: "INV-2026-008", createdAt: new Date("2026-08-10T12:00:00Z"), totalAmount: 990, currency: "usd", status: "paid" },
  { id: "INV-2026-009", createdAt: new Date("2026-08-03T12:00:00Z"), totalAmount: 15475, currency: "usd", status: "paid" },
  { id: "INV-2026-010", createdAt: new Date("2026-07-27T12:00:00Z"), totalAmount: 2300, currency: "usd", status: "pending" },
];

export async function getInvoices({
  pageIndex,
}: GetInvoicesParams): Promise<GetInvoicesResponse> {
  const invoices = MOCK_INVOICES.slice(
    pageIndex * PAGE_SIZE,
    (pageIndex + 1) * PAGE_SIZE,
  );

  return {
    invoices,
    meta: {
      totalCount: MOCK_INVOICES.length,
      totalPages: Math.ceil(MOCK_INVOICES.length / PAGE_SIZE),
    },
  };
}
