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

  const productId = await getInfisicalSecret({
    secretName: "POLAR_PRODUCT_ID",
  });

  const checkout = await polar.checkouts.create({
    products: [productId],
    externalCustomerId: organizationSlug,
  });

  return { checkoutUrl: checkout.url };
}
