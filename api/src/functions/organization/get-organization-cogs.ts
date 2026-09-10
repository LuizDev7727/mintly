import { polar } from "@/lib/polar.ts";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";

type GetOrganizationCogsParams = {
  organizationSlug: string;
  startDate: Date;
  endDate: Date;
};

type GetOrganizationCogsResponse = {
  totalCents: number;
  currency: string;
};

export async function getOrganizationCogs({
  organizationSlug,
  startDate,
  endDate,
}: GetOrganizationCogsParams): Promise<GetOrganizationCogsResponse> {
  // const meterId = await getInfisicalSecret({
  //   secretName: "POLAR_TOTAL_COST_METER_ID",
  // });

  const { total } = await polar.meters.quantities({
    id: "83404fd4-32aa-4a04-81c2-947c13a36a9e",
    externalCustomerId: organizationSlug,
    startTimestamp: startDate,
    endTimestamp: endDate,
    interval: "month",
  });

  return {
    totalCents: total,
    currency: "usd",
  };
}
