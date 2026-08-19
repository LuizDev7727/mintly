ALTER TABLE "webhooks" RENAME COLUMN "organization_id" TO "organization_slug";--> statement-breakpoint
ALTER TABLE "webhooks" DROP CONSTRAINT "webhooks_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_organization_slug_organizations_slug_fk" FOREIGN KEY ("organization_slug") REFERENCES "public"."organizations"("slug") ON DELETE cascade ON UPDATE no action;