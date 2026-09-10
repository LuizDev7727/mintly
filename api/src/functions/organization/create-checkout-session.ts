import { ensurePolarCustomer } from "@/functions/organization/ensure-polar-customer.ts";
import { polar } from "@/lib/polar.ts";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";

type CreateCheckoutSessionParams = {
  organizationSlug: string;
};

type CreateCheckoutSessionResponse = {
  checkoutUrl: string;
};

export async function createCheckoutSession({
  organizationSlug,
}: CreateCheckoutSessionParams): Promise<CreateCheckoutSessionResponse> {
  await ensurePolarCustomer({ organizationSlug });

  // const productId = await getInfisicalSecret({
  //   secretName: "POLAR_PRODUCT_ID",
  // });

  // Subscribing to a product that has any price attached (even a $0 base
  // price with a metered/usage price on top) can't be done silently via
  // subscriptions.create() — Polar requires the customer to go through
  // checkout and confirm, since it's a recurring commitment. This is also
  // where the customer adds their payment method, in the same step.
  const checkout = await polar.checkouts.create({
    products: ["19c9466b-b22b-4bde-9e4c-a2cb921c1ffd"],
    externalCustomerId: organizationSlug,
  });

  return { checkoutUrl: checkout.url };
}
