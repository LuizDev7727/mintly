CREATE TYPE "public"."provider" AS ENUM('YOUTUBE', 'TIKTOK');--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"avatar_url" varchar,
	"access_token" varchar NOT NULL,
	"refresh_token" varchar NOT NULL,
	"refresh_expires_in" integer,
	"expiry_in" integer NOT NULL,
	"provider" "provider" NOT NULL,
	"channel_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;