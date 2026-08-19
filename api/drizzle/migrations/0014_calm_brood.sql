CREATE TYPE "public"."WebhookLogStatus" AS ENUM('PENDING', 'SUCCESS', 'ERROR');--> statement-breakpoint
CREATE TABLE "webhook_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"signing_key" text NOT NULL,
	"status" "WebhookLogStatus" DEFAULT 'PENDING' NOT NULL,
	"error_reason" text,
	"http_code" text,
	"http_method" text,
	"request_body" text,
	"request_headers" text,
	"response_body" text,
	"number_of_retries" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"webhook_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"signing_key" text NOT NULL,
	"events" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"organization_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "api_key" json;--> statement-breakpoint
ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_webhook_id_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;