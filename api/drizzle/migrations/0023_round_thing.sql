ALTER TABLE "organizations" ADD COLUMN "api_key_hash" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_api_key_hash_unique" UNIQUE("api_key_hash");