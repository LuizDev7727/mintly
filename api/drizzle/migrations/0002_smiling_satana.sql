CREATE TYPE "public"."action" AS ENUM('CREATED_CHANNEL', 'CREATED_POST', 'CANCELED_POST', 'DELETED_POST', 'CREATED_PROJECT', 'ADDED_INTEGRATION', 'DELETED_INTEGRATION', 'UPLOAD_INSPIRATIONAL_THUMBNAIL', 'DELETED_INSPIRATIONAL_THUMBNAIL');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" text PRIMARY KEY NOT NULL,
	"action" "action" NOT NULL,
	"description" varchar DEFAULT '' NOT NULL,
	"organization_slug" text NOT NULL,
	"author_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_organization_slug_organizations_slug_fk" FOREIGN KEY ("organization_slug") REFERENCES "public"."organizations"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;