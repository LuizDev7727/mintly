ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'ENCODING';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "polar_customer_id" text;