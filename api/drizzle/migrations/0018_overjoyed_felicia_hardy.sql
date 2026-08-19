ALTER TABLE "webhook_logs" RENAME COLUMN "statusCode" TO "status_code";--> statement-breakpoint
ALTER TABLE "webhook_logs" RENAME COLUMN "contentType" TO "content_type";--> statement-breakpoint
ALTER TABLE "webhook_logs" RENAME COLUMN "contentLength" TO "content_length";--> statement-breakpoint
ALTER TABLE "webhook_logs" RENAME COLUMN "queryParams" TO "query_params";