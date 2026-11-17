CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"post_id" text,
	"best_moment_id" text
);
--> statement-breakpoint
ALTER TABLE "best_moments" ADD COLUMN "start_time" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "best_moments" ADD COLUMN "end_time" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_best_moment_id_best_moments_id_fk" FOREIGN KEY ("best_moment_id") REFERENCES "public"."best_moments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tags_post_id_idx" ON "tags" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "tags_best_moment_id_idx" ON "tags" USING btree ("best_moment_id");