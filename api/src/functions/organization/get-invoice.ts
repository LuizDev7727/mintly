import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { MOCK_INVOICES } from "@/functions/organization/get-invoices.ts";

type GetInvoiceParams = {
  organizationSlug: string;
  invoiceId: string;
};

type GetInvoiceResponse = {
  invoice: {
    id: string;
    status: string;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    dueAt: Date;
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

const MOCK_TAX_RATE = 0.08;

// TODO: mockado enquanto o billing via Polar está fora do ar. Os detalhes são
// derivados do invoice da listagem (get-invoices) para os valores baterem.
export async function getInvoice(
  params: GetInvoiceParams,
): Promise<GetInvoiceResponse> {
  const { invoiceId } = params;

  const listedInvoice = MOCK_INVOICES.find((invoice) => invoice.id === invoiceId);

  if (!listedInvoice) {
    throw new ResourceNotFoundError("Invoice not found");
  }

  const { id, status, currency, createdAt, totalAmount } = listedInvoice;

  const tax = Math.round((totalAmount * MOCK_TAX_RATE) / (1 + MOCK_TAX_RATE));
  const net = totalAmount - tax;
  const isSettled = ["paid", "refunded", "partially_refunded", "void"].includes(
    status,
  );

  let refunded = 0;
  if (status === "refunded") refunded = totalAmount;
  if (status === "partially_refunded") refunded = Math.round(totalAmount / 2);

  return {
    invoice: {
      id,
      status,
      currency,
      createdAt,
      updatedAt: createdAt,
      dueAt: createdAt,
      orderId: "ord_01J7ZKQ4F3MOCK",
      customerId: "cus_01J7ZKQ4F3MOCK",
      billingReason: "subscription_cycle",
      subscriptionId: "sub_01J7ZKQ4F3MOCK",
      productId: "prod_01J7ZKQ4F3MOCK",
      billing: {
        companyName: "Acme Corp",
        taxId: "12.345.678/0001-90",
        address: ["123 Business St.", "San Francisco, CA 94107", "United States"],
      },
      amounts: {
        subtotal: net,
        discount: 0,
        net,
        tax,
        total: totalAmount,
        appliedBalance: 0,
        due: isSettled ? 0 : totalAmount,
        refunded,
      },
      items: [
        {
          description: "Mintly Pro Plan",
          detail: "Monthly subscription",
          quantity: 1,
          unitPrice: net,
          total: net,
        },
      ],
    },
  };
}
