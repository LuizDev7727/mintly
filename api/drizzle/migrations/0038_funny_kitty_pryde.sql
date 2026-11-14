CREATE TYPE "public"."post_event_status" AS ENUM('ENCODED_VIDEO', 'ENCODED_VIDEO_FAILED', 'TRANSCRIBED_AUDIO', 'TRANSCRIBED_AUDIO_FAILED', 'GENERATED_METADATA', 'GENERATED_METADATA_FAILED', 'GENERATED_THUMBNAIL', 'GENERATED_THUMBNAIL_FAILED', 'PUBLISHED', 'PUBLISHED_FAILED');--> statement-breakpoint
CREATE TABLE "post_events" (
	"id" text PRIMARY KEY NOT NULL,
	"status" "post_event_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"post_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post_events" ADD CONSTRAINT "post_events_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_events_post_id_idx" ON "post_events" USING btree ("post_id");