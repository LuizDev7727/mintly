import { CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/** Estado vazio no mesmo tamanho do cartão, para quando não há método de pagamento. */
export function PaymentCardEmpty() {
  return (
    <Empty className="aspect-[1.75] w-96 max-w-full flex-none rounded-xl border p-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CreditCard />
        </EmptyMedia>
        <EmptyTitle className="text-base">No payment method</EmptyTitle>
        <EmptyDescription>
          Add a card to pay for your usage and keep your pipelines running.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm">
          <Plus className="size-4" />
          Add payment method
        </Button>
      </EmptyContent>
    </Empty>
  );
}
