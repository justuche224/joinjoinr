CREATE TABLE "comment" (
	"id" text PRIMARY KEY,
	"event_id" text NOT NULL,
	"parent_id" text,
	"user_id" text,
	"content" text NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_share" (
	"id" text PRIMARY KEY,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"platform" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "like" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "comment_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "like_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "share_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "comment_eventId_idx" ON "comment" ("event_id");--> statement-breakpoint
CREATE INDEX "comment_parentId_idx" ON "comment" ("parent_id");--> statement-breakpoint
CREATE INDEX "comment_userId_idx" ON "comment" ("user_id");--> statement-breakpoint
CREATE INDEX "event_share_eventId_idx" ON "event_share" ("event_id");--> statement-breakpoint
CREATE INDEX "event_share_userId_idx" ON "event_share" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "like_userId_targetType_targetId_idx" ON "like" ("user_id","target_type","target_id");--> statement-breakpoint
CREATE INDEX "like_targetType_targetId_idx" ON "like" ("target_type","target_id");--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_event_id_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_parent_id_comment_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comment"("id");--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "event_share" ADD CONSTRAINT "event_share_event_id_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_share" ADD CONSTRAINT "event_share_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "like" ADD CONSTRAINT "like_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;