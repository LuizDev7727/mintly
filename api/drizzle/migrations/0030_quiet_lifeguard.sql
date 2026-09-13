DROP TABLE "starred_folders" CASCADE;--> statement-breakpoint
ALTER TABLE "folders" ADD COLUMN "is_starred" boolean DEFAULT false NOT NULL;