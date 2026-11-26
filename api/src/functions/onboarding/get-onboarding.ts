import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { asc, eq } from "drizzle-orm";
import { ONBOARDING_STEPS } from "./onboarding-steps.ts";

type GetOnboardingParams = {
  userId: string;
};

type GetOnboardingResponse = {
  step: number;
  total: number;
  completed: boolean;
  organizationSlug: string | null;
  channelId: string | null;
};

export async function getOnboarding(
  params: GetOnboardingParams,
): Promise<GetOnboardingResponse> {
  const { userId } = params;

  const total = ONBOARDING_STEPS.length;

  const [user] = await db
    .select({ step: usersTable.onboardingStep })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  const step = user?.step ?? 0;

  // The org the steps act on: the oldest one the user owns (the automatic one).
  const [organization] = await db
    .select({ slug: organizationsTable.slug })
    .from(organizationsTable)
    .where(eq(organizationsTable.ownerId, userId))
    .orderBy(asc(organizationsTable.createdAt))
    .limit(1);

  const [channel] = organization
    ? await db
        .select({ id: channelsTable.id })
        .from(channelsTable)
        .where(eq(channelsTable.organizationSlug, organization.slug))
        .orderBy(asc(channelsTable.createdAt))
        .limit(1)
    : [];

  return {
    step,
    total,
    completed: step >= total,
    organizationSlug: organization?.slug ?? null,
    channelId: channel?.id ?? null,
  };
}
