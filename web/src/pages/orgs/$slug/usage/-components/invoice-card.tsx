import { CalendarIcon, Download, MoreHorizontal, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dayjs } from "@/lib/dayjs";
import { formatAmount } from "@/utils/format-amount";
import { InvoiceDetailsSheet } from "./invoice-details-sheet";
import { invoiceStatusConfig, type InvoiceStatus } from "./invoice-status";

type InvoiceCardProps = {
  invoice: {
    id: string;
    createdAt: string;
    totalAmount: number;
    currency: string;
    status: string;
  };
};

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const status = invoiceStatusConfig[invoice.status as InvoiceStatus];

  return (
    <article className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border/60 bg-linear-to-br from-foreground/4 to-transparent dark:bg-zinc-900/20 p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-muted-foreground transition-colors group-hover:text-primary">
          <ReceiptText className="size-4" />
        </div>
        <Badge
          variant={status.variant}
          className={`rounded-md ${status.className}`}
        >
          {status.label}
        </Badge>
      </div>

      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground">{invoice.id}</p>
        <p className="text-xl font-semibold tracking-tight tabular-nums">
          {formatAmount(invoice.totalAmount, invoice.currency)}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarIcon className="size-3.5" />
          {dayjs(invoice.createdAt).format("MMM DD, YYYY")}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions for {invoice.id}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <InvoiceDetailsSheet invoiceId={invoice.id} />
            <DropdownMenuItem>
              <Download className="size-4" />
              Download
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}
