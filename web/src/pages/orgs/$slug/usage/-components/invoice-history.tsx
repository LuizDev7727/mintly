import { FilterIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInvoicesHttp } from "@/http/organization/get-invoices.http";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { parseAsInteger, useQueryState } from "nuqs";
import { InvoiceCard } from "./invoice-card";
import { InvoiceCardSkeleton } from "./invoice-card-skeleton";
import { InvoiceHistoryEmpty } from "./invoice-history-empty";
import { invoiceStatusConfig } from "./invoice-status";
import { InvoicesPagination } from "./invoices-pagination";

const ALL_STATUSES = "all";
const SKELETON_CARDS_COUNT = 8;

export function InvoiceHistory() {
  const { slug } = useParams({ from: "/orgs/$slug" });

  const [currentPage] = useQueryState(
    "invoice_page",
    parseAsInteger.withDefault(0),
  );
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", slug, currentPage],
    queryFn: () =>
      getInvoicesHttp({ orgSlug: slug, pageIndex: currentPage }),
    placeholderData: keepPreviousData,
  });

  const allInvoices = data?.invoices ?? [];
  const totalCount = data?.meta.totalCount ?? 0;
  const totalPages = data?.meta.totalPages ?? 0;

  const invoices = allInvoices.filter(
    (invoice) =>
      statusFilter === ALL_STATUSES || invoice.status === statusFilter,
  );

  const isEmpty = !isLoading && invoices.length === 0;

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-medium">Invoice History</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FilterIcon className="size-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <DropdownMenuRadioItem value={ALL_STATUSES}>
                All statuses
              </DropdownMenuRadioItem>
              {Object.entries(invoiceStatusConfig).map(([status, config]) => (
                <DropdownMenuRadioItem key={status} value={status}>
                  {config.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {isEmpty && (
        <InvoiceHistoryEmpty isFiltered={allInvoices.length > 0} />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {isLoading &&
          Array.from({ length: SKELETON_CARDS_COUNT }, (_, index) => (
            <InvoiceCardSkeleton key={index} />
          ))}
        {invoices.map((invoice) => (
          <InvoiceCard key={invoice.id} invoice={invoice} />
        ))}
      </div>

      <footer className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Showing {invoices.length} of {totalCount} data
        </span>
        <InvoicesPagination totalPages={totalPages} />
      </footer>
    </section>
  );
}
