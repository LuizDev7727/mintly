CREATE TYPE "public"."project_status" AS ENUM('SUCCESS', 'PROCESSING', 'SCHEDULED', 'ERROR');--> statement-breakpoint
CREATE TABLE "best_moments" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"storage_key" text NOT NULL,
	"project_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"thumbnail_url" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" "project_status" DEFAULT 'PROCESSING' NOT NULL,
	"channel_id" text NOT NULL,
	"owner_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "best_moments" ADD CONSTRAINT "best_moments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;