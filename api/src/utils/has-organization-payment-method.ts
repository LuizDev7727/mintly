import { polar } from "@/lib/polar.ts";

type HasOrganizationPaymentMethodParams = {
  organizationSlug: string;
};

type HasOrganizationPaymentMethodResponse = {
  hasOrganizationPaymentMethod: boolean;
};

export async function hasOrganizationPaymentMethod(
  params: HasOrganizationPaymentMethodParams,
): Promise<HasOrganizationPaymentMethodResponse> {
  const { organizationSlug } = params;

  const { result } = await polar.customers.listPaymentMethodsExternal({
    externalId: organizationSlug,
  });

  const hasOrganizationPaymentMethod = result.items.length > 0;

  return {
    hasOrganizationPaymentMethod
  };
}
