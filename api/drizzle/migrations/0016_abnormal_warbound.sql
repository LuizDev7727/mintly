ALTER TABLE "webhook_logs" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "webhook_logs" ALTER COLUMN "status" SET DEFAULT 'PENDING'::text;--> statement-breakpoint
DROP TYPE "public"."WebhookLogStatus";--> statement-breakpoint
CREATE TYPE "public"."WebhookLogStatus" AS ENUM('PENDING', 'SUCCESS', 'FAILED');--> statement-breakpoint
ALTER TABLE "webhook_logs" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"public"."WebhookLogStatus";--> statement-breakpoint
ALTER TABLE "webhook_logs" ALTER COLUMN "status" SET DATA TYPE "public"."WebhookLogStatus" USING "status"::"public"."WebhookLogStatus";