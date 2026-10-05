import {
  Building2,
  CircleDollarSign,
  Download,
  ExternalLink,
  FileText,
  ListIcon,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getInvoiceHttp } from "@/http/organization/get-invoice.http";
import { dayjs } from "@/lib/dayjs";
import { formatAmount } from "@/utils/format-amount";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { InvoiceDetailsSkeleton } from "./invoice-details-skeleton";
import { invoiceStatusConfig, type InvoiceStatus } from "./invoice-status";

type InvoiceDetailsSheetProps = {
  invoiceId: string;
};

const sectionClassName = "rounded-xl border border-border/60 p-4";

/** Item de menu que abre o sheet com os detalhes do invoice. O invoice só é buscado quando o sheet abre. */
export function InvoiceDetailsSheet({ invoiceId }: InvoiceDetailsSheetProps) {
  const { slug } = useParams({ from: "/orgs/$slug" });
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoice", slug, invoiceId],
    queryFn: () => getInvoiceHttp({ orgSlug: slug, invoiceId }),
    enabled: isOpen,
  });

  const invoice = data?.invoice;
  const status = invoice
    ? invoiceStatusConfig[invoice.status as InvoiceStatus]
    : null;

  const metadata = invoice
    ? [
        { label: "Order ID", value: invoice.orderId },
        { label: "Customer ID", value: invoice.customerId },
        { label: "Billing reason", value: invoice.billingReason },
        { label: "Subscription ID", value: invoice.subscriptionId },
        { label: "Product ID", value: invoice.productId },
        { label: "Currency", value: invoice.currency.toUpperCase() },
      ]
    : [];

  const amountsSummary = invoice
    ? [
        {
          label: "Subtotal",
          value: formatAmount(invoice.amounts.subtotal, invoice.currency),
        },
        {
          label: "Discount",
          value:
            invoice.amounts.discount > 0
              ? `- ${formatAmount(invoice.amounts.discount, invoice.currency)}`
              : formatAmount(0, invoice.currency),
        },
        {
          label: "Net amount",
          value: formatAmount(invoice.amounts.net, invoice.currency),
        },
        {
          label: "Tax amount",
          value: formatAmount(invoice.amounts.tax, invoice.currency),
        },
      ]
    : [];

  const amountsBalance = invoice
    ? [
        {
          label: "Applied balance",
          value: formatAmount(invoice.amounts.appliedBalance, invoice.currency),
        },
        {
          label: "Due amount",
          value: formatAmount(invoice.amounts.due, invoice.currency),
        },
        {
          label: "Refunded amount",
          value: formatAmount(invoice.amounts.refunded, invoice.currency),
        },
      ]
    : [];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          <FileText className="size-4" />
          View details
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="flex-row items-center gap-3 border-b border-border/60 px-6 py-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="size-4" />
          </div>
          <div>
            <SheetTitle>Invoice details</SheetTitle>
            <SheetDescription>
              View all information about this invoice.
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {isError && (
            <p className="text-sm text-muted-foreground">
              Could not load this invoice. Try again in a moment.
            </p>
          )}
          {(isLoading || (!invoice && !isError)) && <InvoiceDetailsSkeleton />}
          {invoice && status && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold tracking-tight">
                      {invoice.id}
                    </h2>
                    <Badge
                      variant={status.variant}
                      className={`rounded-md ${status.className}`}
                    >
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Issued on{" "}
                    <span className="text-foreground">
                      {dayjs(invoice.createdAt).format("MMM DD, YYYY")}
                    </span>
                    <span className="mx-2">•</span>
                    Due on{" "}
                    <span className="text-foreground">
                      {dayjs(invoice.dueAt).format("MMM DD, YYYY")}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total amount</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {formatAmount(invoice.amounts.total, invoice.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {invoice.currency.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button>
                  <Download className="size-4" />
                  Download invoice
                </Button>
                <Button variant="outline">
                  <ExternalLink className="size-4" />
                  View on Polar
                </Button>
              </div>

              <section
                className={`${sectionClassName} grid grid-cols-3 gap-y-5 [&>div:not(:nth-child(3n+1))]:border-l [&>div:not(:nth-child(3n+1))]:border-border/60 [&>div:not(:nth-child(3n+1))]:pl-4`}
              >
                {metadata.map((item) => (
                  <div key={item.label} className="min-w-0 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="truncate text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </section>

              <section className={sectionClassName}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="size-4 text-primary" />
                    Billing information
                  </h3>
                  <button
                    type="button"
                    className="cursor-pointer text-xs font-medium text-primary hover:underline"
                  >
                    View details
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Company name
                      </p>
                      <p className="text-sm font-medium">
                        {invoice.billing.companyName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tax ID</p>
                      <p className="text-sm font-medium">
                        {invoice.billing.taxId}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 border-l border-border/60 pl-4">
                    <p className="text-xs text-muted-foreground">
                      Billing address
                    </p>
                    {invoice.billing.address.map((line) => (
                      <p key={line} className="text-sm font-medium">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </section>

              <section className={sectionClassName}>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-medium">
                  <CircleDollarSign className="size-4 text-primary" />
                  Amounts
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {amountsSummary.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="tabular-nums">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 text-sm font-semibold">
                      <span>Total amount</span>
                      <span className="tabular-nums">
                        {formatAmount(invoice.amounts.total, invoice.currency)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 border-l border-border/60 pl-4">
                    {amountsBalance.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="tabular-nums">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className={sectionClassName}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <ListIcon className="size-4 text-primary" />
                  Items
                </h3>
                <div className="grid grid-cols-[1fr_4rem_5.5rem_5.5rem] gap-2 rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <span>Description</span>
                  <span>Quantity</span>
                  <span className="text-right">Unit price</span>
                  <span className="text-right">Total</span>
                </div>
                {invoice.items.map((item) => (
                  <div
                    key={item.description}
                    className="grid grid-cols-[1fr_4rem_5.5rem_5.5rem] gap-2 px-3 py-3 text-xs"
                  >
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-muted-foreground">{item.detail}</p>
                    </div>
                    <span>{item.quantity}</span>
                    <span className="text-right tabular-nums">
                      {formatAmount(item.unitPrice, invoice.currency)}
                    </span>
                    <span className="text-right tabular-nums">
                      {formatAmount(item.total, invoice.currency)}
                    </span>
                  </div>
                ))}
              </section>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Created at</p>
                  <p className="font-medium">
                    {dayjs(invoice.createdAt).format("MMM DD, YYYY h:mm A")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Last updated</p>
                  <p className="font-medium">
                    {dayjs(invoice.updatedAt).format("MMM DD, YYYY h:mm A")}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
