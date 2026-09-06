ALTER TABLE "folders" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (immutable_to_tsvector(coalesce(title, ''))) STORED;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (immutable_to_tsvector(coalesce(title, '') || ' ' || coalesce(description, ''))) STORED;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (immutable_to_tsvector(coalesce(title, ''))) STORED;--> statement-breakpoint
CREATE INDEX "folders_search_vector_idx" ON "folders" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "posts_search_vector_idx" ON "posts" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "projects_search_vector_idx" ON "projects" USING gin ("search_vector");