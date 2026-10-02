import { ReceiptText } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type InvoiceHistoryEmptyProps = {
  isFiltered: boolean;
};

/** Estado vazio da listagem de invoices, sem invoices ou sem resultado para o filtro aplicado. */
export function InvoiceHistoryEmpty({ isFiltered }: InvoiceHistoryEmptyProps) {
  return (
    <Empty className="rounded-xl border p-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ReceiptText />
        </EmptyMedia>
        <EmptyTitle className="text-base">
          {isFiltered ? "No matching invoices" : "No invoices yet"}
        </EmptyTitle>
        <EmptyDescription>
          {isFiltered
            ? "No invoices match the selected status. Try another filter."
            : "Your invoices will show up here once your organization is billed."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
