ALTER TABLE "users" ADD COLUMN "onboarding_step" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
-- Backfill: existing users are already past onboarding (ONBOARDING_STEPS.length = 3).
UPDATE "users" SET "onboarding_step" = 3;
