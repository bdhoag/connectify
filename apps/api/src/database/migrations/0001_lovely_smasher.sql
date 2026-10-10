ALTER TABLE "post_media" ADD COLUMN "public_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "post_media" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "comment_media" ADD COLUMN "public_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "comment_media" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "message_media" ADD COLUMN "public_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "message_media" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;