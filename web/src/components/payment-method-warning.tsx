import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePaymentMethodStatus } from "@/hooks/use-payment-method-status";
import { createCheckoutSessionHttp } from "@/http/organization/create-checkout-session.http";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";

export function PaymentMethodWarning() {
  const { slug } = useParams({ from: "/orgs/$slug" });

  const { hasPaymentMethod, isLoading } = usePaymentMethodStatus({
    orgSlug: slug,
  });

  const { mutateAsync: createCheckoutSession, isPending } = useMutation({
    mutationFn: createCheckoutSessionHttp,
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl;
    },
    onError: () => {
      toast.error("Could not open checkout. Please try again.");
    },
  });

  if (isLoading || hasPaymentMethod) {
    return null;
  }

  function handleClick() {
    createCheckoutSession({ orgSlug: slug });
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 py-1 pl-3 pr-1 text-xs text-destructive">
      <CreditCard className="size-3.5 shrink-0" />
      <span className="hidden sm:inline">
        Add a payment method to create posts and projects
      </span>
      <Button
        size="sm"
        variant="destructive"
        className="h-6 shrink-0 rounded-full px-2.5 text-xs"
        disabled={isPending}
        onClick={handleClick}
      >
        {isPending ? <Spinner className="size-3.5" /> : "Add card"}
      </Button>
    </div>
  );
}
