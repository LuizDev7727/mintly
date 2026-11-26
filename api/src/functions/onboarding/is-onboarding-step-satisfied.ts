import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";
import { invitationsTable } from "@/infra/db/tables/invitations.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { eq } from "drizzle-orm";
import type { OnboardingStep } from "./onboarding-steps.ts";

type IsOnboardingStepSatisfiedParams = {
  userId: string;
  step: OnboardingStep;
};

// A step is satisfied when the resource exists in any organization the user owns.
export async function isOnboardingStepSatisfied(
  params: IsOnboardingStepSatisfiedParams,
): Promise<boolean> {
  const { userId, step } = params;

  if (step === "invite") {
    const [row] = await db
      .select({ id: invitationsTable.id })
      .from(invitationsTable)
      .innerJoin(
        organizationsTable,
        eq(invitationsTable.organizationSlug, organizationsTable.slug),
      )
      .where(eq(organizationsTable.ownerId, userId))
      .limit(1);

    return row !== undefined;
  }

  if (step === "channel") {
    const [row] = await db
      .select({ id: channelsTable.id })
      .from(channelsTable)
      .innerJoin(
        organizationsTable,
        eq(channelsTable.organizationSlug, organizationsTable.slug),
      )
      .where(eq(organizationsTable.ownerId, userId))
      .limit(1);

    return row !== undefined;
  }

  const [row] = await db
    .select({ id: integrationsTable.id })
    .from(integrationsTable)
    .innerJoin(channelsTable, eq(integrationsTable.channelId, channelsTable.id))
    .innerJoin(
      organizationsTable,
      eq(channelsTable.organizationSlug, organizationsTable.slug),
    )
    .where(eq(organizationsTable.ownerId, userId))
    .limit(1);

  return row !== undefined;
}
