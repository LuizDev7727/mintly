// The order is a contract with the database: `users.onboarding_step` stores how
// many steps are done. Never reorder or insert in the middle; append at the end
// and backfill finished users in the migration that adds the step.
export const ONBOARDING_STEPS = ["invite", "channel", "integration"] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
