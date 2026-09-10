import { ensurePolarCustomer } from "@/functions/organization/ensure-polar-customer.ts";
import { polar } from "@/lib/polar.ts";

type CreateBillingPortalSessionParams = {
  organizationSlug: string;
};

type CreateBillingPortalSessionResponse = {
  portalUrl: string;
};

export async function createBillingPortalSession({
  organizationSlug,
}: CreateBillingPortalSessionParams): Promise<CreateBillingPortalSessionResponse> {
  const { polarCustomerId } = await ensurePolarCustomer({ organizationSlug });

  const session = await polar.customerSessions.create({
    customerId: polarCustomerId,
  });

  return { portalUrl: session.customerPortalUrl };
}
