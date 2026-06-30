CREATE TYPE "public"."plan" AS ENUM('free', 'pro');--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "plan" "plan" DEFAULT 'free' NOT NULL;