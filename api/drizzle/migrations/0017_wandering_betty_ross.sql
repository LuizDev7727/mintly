ALTER TABLE "webhook_logs" RENAME COLUMN "http_method" TO "method";--> statement-breakpoint
ALTER TABLE "webhook_logs" RENAME COLUMN "http_code" TO "statusCode";--> statement-breakpoint
ALTER TABLE "webhook_logs" RENAME COLUMN "request_headers" TO "headers";--> statement-breakpoint
ALTER TABLE "webhook_logs" RENAME COLUMN "response_body" TO "body";--> statement-breakpoint
ALTER TABLE "webhook_logs" ADD COLUMN "pathname" text NOT NULL;--> statement-breakpoint
ALTER TABLE "webhook_logs" ADD COLUMN "ip" text NOT NULL;--> statement-breakpoint
ALTER TABLE "webhook_logs" ADD COLUMN "contentType" text;--> statement-breakpoint
ALTER TABLE "webhook_logs" ADD COLUMN "contentLength" integer;--> statement-breakpoint
ALTER TABLE "webhook_logs" ADD COLUMN "queryParams" jsonb;--> statement-breakpoint
ALTER TABLE "webhook_logs" DROP COLUMN "error_reason";--> statement-breakpoint
ALTER TABLE "webhook_logs" DROP COLUMN "request_body";