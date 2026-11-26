import { OnboardingStepNotSkippableError } from "@/errors/onboarding-step-not-skippable.error.ts";
import { db } from "@/infra/db/client.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { and, eq } from "drizzle-orm";
import { advanceOnboarding } from "./advance-onboarding.ts";
import { ONBOARDING_STEPS } from "./onboarding-steps.ts";

type SkipOnboardingInviteParams = {
  userId: string;
};

type SkipOnboardingInviteResponse = {
  step: number;
};

export async function skipOnboardingInvite(
  params: SkipOnboardingInviteParams,
): Promise<SkipOnboardingInviteResponse> {
  const { userId } = params;

  const inviteStep = ONBOARDING_STEPS.indexOf("invite");

  // Conditional update: only moves when the user is exactly on the invite step.
  const updated = await db
    .update(usersTable)
    .set({ onboardingStep: inviteStep + 1 })
    .where(
      and(
        eq(usersTable.id, userId),
        eq(usersTable.onboardingStep, inviteStep),
      ),
    )
    .returning({ id: usersTable.id });

  if (updated.length === 0) {
    throw new OnboardingStepNotSkippableError();
  }

  return advanceOnboarding({ userId });
}
