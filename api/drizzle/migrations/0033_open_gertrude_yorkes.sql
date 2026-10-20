CREATE TYPE "public"."video_status" AS ENUM('READY', 'GENERATING', 'FAILED');--> statement-breakpoint
CREATE TABLE "videos" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text,
	"status" "video_status" DEFAULT 'GENERATING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"channel_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;