CREATE TABLE "channels" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"organization_slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_organization_slug_organizations_slug_fk" FOREIGN KEY ("organization_slug") REFERENCES "public"."organizations"("slug") ON DELETE cascade ON UPDATE no action;