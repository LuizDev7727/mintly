import { db } from "@/infra/db/client.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { eq } from "drizzle-orm";
import { isOnboardingStepSatisfied } from "./is-onboarding-step-satisfied.ts";
import { ONBOARDING_STEPS } from "./onboarding-steps.ts";

type AdvanceOnboardingParams = {
  userId: string;
};

type AdvanceOnboardingResponse = {
  step: number;
};

// Idempotent: re-evaluates the steps in order from the stored value and stops at
// the first one that is not satisfied yet.
export async function advanceOnboarding(
  params: AdvanceOnboardingParams,
): Promise<AdvanceOnboardingResponse> {
  const { userId } = params;

  const [user] = await db
    .select({ step: usersTable.onboardingStep })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) {
    return { step: 0 };
  }

  let step = user.step;

  while (step < ONBOARDING_STEPS.length) {
    const satisfied = await isOnboardingStepSatisfied({
      userId,
      step: ONBOARDING_STEPS[step],
    });

    if (!satisfied) break;

    step++;
  }

  if (step !== user.step) {
    await db
      .update(usersTable)
      .set({ onboardingStep: step })
      .where(eq(usersTable.id, userId));
  }

  return { step };
}
