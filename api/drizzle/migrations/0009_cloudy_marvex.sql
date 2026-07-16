ALTER TYPE "public"."project_status" ADD VALUE 'CANCELED';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "run_id" text;