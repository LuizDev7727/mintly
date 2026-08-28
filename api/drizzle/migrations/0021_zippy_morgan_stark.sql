ALTER TYPE "public"."provider" ADD VALUE 'INSTAGRAM';--> statement-breakpoint
ALTER TABLE "integrations" ADD COLUMN "username" varchar;
