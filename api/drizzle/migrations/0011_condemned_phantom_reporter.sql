CREATE TABLE "starred_folders" (
	"id" text PRIMARY KEY NOT NULL,
	"folder_id" text NOT NULL,
	"channel_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "starred_folders" ADD CONSTRAINT "starred_folders_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starred_folders" ADD CONSTRAINT "starred_folders_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;