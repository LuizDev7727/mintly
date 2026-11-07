CREATE TABLE "colors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"hex" varchar(9) NOT NULL,
	"channel_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "colors" ADD CONSTRAINT "colors_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;