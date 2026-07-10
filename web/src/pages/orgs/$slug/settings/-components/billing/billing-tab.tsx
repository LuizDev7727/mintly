import { BillingEmailForm } from "./billing-email-form";
import { InvoiceHistory } from "./invoice-history";
import { PaymentMethod } from "./payment-method";

export function BillingTab() {
  return (
    <div className="space-y-4">
      <BillingEmailForm />
      <PaymentMethod />
      <InvoiceHistory />
    </div>
  );
}
