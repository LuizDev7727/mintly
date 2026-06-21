import { CreditCard } from "lucide-react";

export function NoPaymentMethod() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-muted-foreground">
      <CreditCard className="size-5 shrink-0" />
      <p className="text-sm">No payment method added yet.</p>
    </div>
  );
}
