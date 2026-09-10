import { useQuery } from "@tanstack/react-query";
import { getOrganizationPaymentMethodStatusHttp } from "@/http/organization/get-organization-payment-method-status.http";

type usePaymentMethodStatusParams = {
  orgSlug: string;
};

export function usePaymentMethodStatus(params: usePaymentMethodStatusParams) {
  const { orgSlug } = params;
  const { data, isLoading } = useQuery({
    queryKey: ["organization-payment-method", orgSlug],
    queryFn: () => getOrganizationPaymentMethodStatusHttp({ orgSlug }),
  });

  return {
    hasPaymentMethod: data?.hasOrganizationPaymentMethod ?? false,
    isLoading,
  };
}
