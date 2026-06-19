import { Check, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmRemovePaymentMethodDialog } from "./confirm-remove-payment-method-dialog";

interface PaymentMethodCardProps {
  last4: string;
  expiry: string;
  isDefault?: boolean;
  onSetDefault?: () => void;
  onRemove?: () => void;
}

export function PaymentMethodCard({
  last4,
  expiry,
  isDefault = false,
  onSetDefault,
  onRemove,
}: PaymentMethodCardProps) {

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-lg border p-4 transition-colors",
        isDefault && "bg-accent/50"
      )}
    >
      <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded border">
        <CreditCard className="size-4 text-muted-foreground" />
      </div>

      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-sm font-medium">Card ending in {last4}</p>
        <p className="text-xs text-muted-foreground">Expiry {expiry}</p>
        <div className="mt-1 flex items-center gap-3">
          {!isDefault && (
            <button
              onClick={onSetDefault}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Set as default
            </button>
          )}
{!isDefault && (
            <ConfirmRemovePaymentMethodDialog
              last4={last4}
              onConfirm={onRemove}
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          isDefault
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30"
        )}
      >
        {isDefault && <Check className="size-3" strokeWidth={3} />}
      </div>
    </div>
  );
}
