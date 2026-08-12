CREATE TABLE "event" (
	"id" text PRIMARY KEY,
	"slug" text NOT NULL UNIQUE,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"venue" text NOT NULL,
	"city" text NOT NULL,
	"address" text NOT NULL,
	"image" text NOT NULL,
	"image_alt" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_session" (
	"id" text PRIMARY KEY,
	"event_id" text NOT NULL,
	"label" text NOT NULL,
	"time" text NOT NULL,
	"datetime" timestamp NOT NULL,
	"doors" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"total_amount" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_reference" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket" (
	"id" text PRIMARY KEY,
	"order_id" text NOT NULL,
	"session_id" text NOT NULL,
	"tier_id" text NOT NULL,
	"user_id" text NOT NULL,
	"code" text NOT NULL UNIQUE,
	"status" text DEFAULT 'valid' NOT NULL,
	"scanned_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_tier" (
	"id" text PRIMARY KEY,
	"session_id" text NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"description" text,
	"capacity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "event_session_eventId_idx" ON "event_session" ("event_id");--> statement-breakpoint
CREATE INDEX "order_userId_idx" ON "order" ("user_id");--> statement-breakpoint
CREATE INDEX "ticket_orderId_idx" ON "ticket" ("order_id");--> statement-breakpoint
CREATE INDEX "ticket_userId_idx" ON "ticket" ("user_id");--> statement-breakpoint
CREATE INDEX "ticket_sessionId_idx" ON "ticket" ("session_id");--> statement-breakpoint
CREATE INDEX "ticket_code_idx" ON "ticket" ("code");--> statement-breakpoint
CREATE INDEX "ticket_tier_sessionId_idx" ON "ticket_tier" ("session_id");--> statement-breakpoint
ALTER TABLE "event_session" ADD CONSTRAINT "event_session_event_id_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_order_id_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_session_id_event_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "event_session"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_tier_id_ticket_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "ticket_tier"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ticket_tier" ADD CONSTRAINT "ticket_tier_session_id_event_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "event_session"("id") ON DELETE CASCADE;