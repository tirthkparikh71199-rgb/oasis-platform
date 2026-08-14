CREATE TYPE "public"."campaign_channel" AS ENUM('EMAIL', 'WHATSAPP');--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"phone" text,
	"name" text,
	"source" text DEFAULT 'NEWSLETTER' NOT NULL,
	"unsubscribed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaign_recipients" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign_recipients" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "channel" "campaign_channel" DEFAULT 'EMAIL' NOT NULL;--> statement-breakpoint
CREATE INDEX "subscribers_email_idx" ON "subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "subscribers_phone_idx" ON "subscribers" USING btree ("phone");