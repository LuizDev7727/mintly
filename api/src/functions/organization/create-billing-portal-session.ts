type CreateBillingPortalSessionParams = {
  organizationSlug: string;
};

type CreateBillingPortalSessionResponse = {
  portalUrl: string;
};

// TODO: mockado enquanto o billing via Polar está fora do ar.
export async function createBillingPortalSession(
  _params: CreateBillingPortalSessionParams,
): Promise<CreateBillingPortalSessionResponse> {
  return { portalUrl: "https://example.com/mock-billing-portal" };
}
