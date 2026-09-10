import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createBillingPortalSessionHttp } from "@/http/organization/create-billing-portal-session.http";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";

export function AddPaymentMethod() {
  const { slug } = useParams({ from: "/orgs/$slug" });

  const { mutateAsync: createBillingPortalSession, isPending } = useMutation({
    mutationFn: createBillingPortalSessionHttp,
    onSuccess: ({ portalUrl }) => {
      window.location.href = portalUrl;
    },
    onError: () => {
      toast.error("Could not open the billing portal. Please try again.");
    },
  });

  function handleClick() {
    createBillingPortalSession({ orgSlug: slug });
  }

  return (
    <Button size="sm" variant="outline" disabled={isPending} onClick={handleClick}>
      {isPending ? <Spinner className="size-4" /> : <Plus className="size-4" />}
      Add payment method
    </Button>
  );
}
