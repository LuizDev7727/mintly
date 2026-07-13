CREATE TABLE "inspirational_thumbnails" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"sizeInMs" integer NOT NULL,
	"channel_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inspirational_thumbnails" ADD CONSTRAINT "inspirational_thumbnails_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;