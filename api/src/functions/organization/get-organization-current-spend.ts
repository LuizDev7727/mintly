import { infisical } from "@/lib/infisical.ts";
import { polar } from "@/lib/polar.ts";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";

type GetOrganizationCurrentSpendParams = {
  organizationSlug: string;
};

type GetOrganizationCurrentSpendResponse = {
  totalCents: number;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
  breakdown: {
    meterId: string;
    amountCents: number;
    consumedUnits: number;
  }[];
};

export async function getOrganizationCurrentSpend({
  organizationSlug,
}: GetOrganizationCurrentSpendParams): Promise<GetOrganizationCurrentSpendResponse> {
  const customerState = await polar.customers.getStateExternal({
    externalId: organizationSlug,
  });

  const [subscription] = customerState.activeSubscriptions;

  if (!subscription) {
    return {
      totalCents: 0,
      currency: "usd",
      periodStart: new Date(),
      periodEnd: new Date(),
      breakdown: [],
    };
  }

  // subscription.meters only reflects whichever metered prices existed on
  // the product when the subscription was created/last synced, and its
  // consumedUnits/amount lag behind real-time events (they're recomputed by
  // Polar's billing cycle manager, not updated per-event). Querying each
  // meter directly via meters.quantities() reads the raw events instead, so
  // it always reflects current usage, and covers every metered price on the
  // product today — not just the ones the subscription happened to snapshot.

  const polarProductId = await getInfisicalSecret({
    secretName: "POLAR_PRODUCT_ID"
  })

  const product = await polar.products.get({
    id: polarProductId,
  });

  const meteredPrices = product.prices.filter(
    (price) => price.amountType === "metered_unit",
  );

  const breakdown = await Promise.all(
    meteredPrices.map(async (price) => {
      const { total: consumedUnits } = await polar.meters.quantities({
        id: price.meterId,
        externalCustomerId: organizationSlug,
        startTimestamp: subscription.currentPeriodStart,
        endTimestamp: subscription.currentPeriodEnd,
        interval: "month",
      });

      return {
        meterId: price.meterId,
        consumedUnits,
        amountCents: consumedUnits * Number(price.unitAmount),
      };
    }),
  );

  const meteredCents = breakdown.reduce(
    (sum, meter) => sum + meter.amountCents,
    0,
  );

  return {
    totalCents: subscription.amount + meteredCents,
    currency: subscription.currency,
    periodStart: subscription.currentPeriodStart,
    periodEnd: subscription.currentPeriodEnd,
    breakdown,
  };
}
