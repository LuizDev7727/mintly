type HasOrganizationPaymentMethodParams = {
  organizationSlug: string;
};

type HasOrganizationPaymentMethodResponse = {
  hasOrganizationPaymentMethod: boolean;
};

// TODO: mockado enquanto o billing via Polar está fora do ar.
export async function hasOrganizationPaymentMethod(
  _params: HasOrganizationPaymentMethodParams,
): Promise<HasOrganizationPaymentMethodResponse> {
  return { hasOrganizationPaymentMethod: true };
}
