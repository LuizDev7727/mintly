CREATE TYPE "public"."post_status" AS ENUM('PROCESSING', 'SCHEDULED', 'PUBLISHED', 'ERROR', 'ENCODING', 'TRANSCRIBING', 'SEO_GENERATING', 'GENERATING_METADATA', 'GENERATING_THUMBNAIL', 'PUBLISHING');--> statement-breakpoint
CREATE TYPE "public"."social_type" AS ENUM('YOUTUBE', 'TIKTOK');--> statement-breakpoint
CREATE TABLE "socials_to_post" (
	"id" text PRIMARY KEY NOT NULL,
	"social" "social_type" NOT NULL,
	"social_name" varchar NOT NULL,
	"post_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "thumbnail_storage_key" varchar;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "title" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "mime_type" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "description" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "run_id" varchar;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "size" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "duration" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "status" "post_status" DEFAULT 'PROCESSING' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "transcription" jsonb;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "scheduled_to" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "owner_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "socials_to_post" ADD CONSTRAINT "socials_to_post_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;