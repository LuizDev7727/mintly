type CreateCheckoutSessionParams = {
  organizationSlug: string;
};

type CreateCheckoutSessionResponse = {
  checkoutUrl: string;
};

// TODO: mockado enquanto o billing via Polar está fora do ar.
export async function createCheckoutSession(
  _params: CreateCheckoutSessionParams,
): Promise<CreateCheckoutSessionResponse> {
  return { checkoutUrl: "https://example.com/mock-checkout" };
}
