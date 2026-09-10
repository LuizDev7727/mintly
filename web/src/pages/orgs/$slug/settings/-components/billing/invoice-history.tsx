import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInvoicesHttp } from "@/http/organization/get-invoices.http";
import { dayjs } from "@/lib/dayjs";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { parseAsInteger, useQueryState } from "nuqs";
import { InvoicesPagination } from "./invoices-pagination";

type InvoiceStatus =
  | "draft"
  | "pending"
  | "paid"
  | "refunded"
  | "partially_refunded"
  | "void";

const statusConfig: Record<
  InvoiceStatus,
  { label: string; variant: "secondary" | "outline" | "destructive" }
> = {
  draft: { label: "Draft", variant: "outline" },
  pending: { label: "Pending", variant: "outline" },
  paid: { label: "Paid", variant: "secondary" },
  refunded: { label: "Refunded", variant: "outline" },
  partially_refunded: { label: "Partially refunded", variant: "outline" },
  void: { label: "Void", variant: "destructive" },
};

function formatAmount(totalAmount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(totalAmount / 100);
}

export function InvoiceHistory() {
  const { slug } = useParams({ from: "/orgs/$slug" });

  const [currentPage] = useQueryState(
    "invoice_page",
    parseAsInteger.withDefault(0),
  );

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", slug, currentPage],
    queryFn: () =>
      getInvoicesHttp({ orgSlug: slug, pageIndex: currentPage }),
    placeholderData: keepPreviousData,
  });

  const invoices = data?.invoices ?? [];
  const totalPages = data?.meta.totalPages ?? 0;
  const isEmpty = !isLoading && invoices.length === 0;

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Invoice History</CardTitle>
        <CardDescription>
          Download or review your past invoices.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6">Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="px-6 text-muted-foreground">
                  Loading invoices...
                </TableCell>
              </TableRow>
            )}
            {isEmpty && (
              <TableRow>
                <TableCell colSpan={5} className="px-6 text-muted-foreground">
                  No invoices yet.
                </TableCell>
              </TableRow>
            )}
            {invoices.map((invoice) => {
              const status = statusConfig[invoice.status as InvoiceStatus];
              return (
                <TableRow key={invoice.id}>
                  <TableCell className="px-6 font-medium">
                    {invoice.id}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dayjs(invoice.createdAt).format("MMM D, YYYY")}
                  </TableCell>
                  <TableCell>
                    {formatAmount(invoice.totalAmount, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="icon-sm">
                      <Download className="size-4" />
                      <span className="sr-only">Download {invoice.id}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <div className="flex justify-end px-6 py-4">
        <InvoicesPagination totalPages={totalPages} />
      </div>
    </Card>
  );
}
