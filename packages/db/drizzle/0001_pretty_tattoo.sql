CREATE TYPE "public"."chat_type" AS ENUM('system', 'user');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('pending', 'in_progress', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('create', 'new_example', 'revise');--> statement-breakpoint
CREATE TABLE "chats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"termId" integer NOT NULL,
	"role" "chat_type" NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "definitionEdits" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "definitionEdits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"definitionId" integer NOT NULL,
	"prevDefinition" text,
	"definition" text NOT NULL,
	"editedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "terms" DROP CONSTRAINT "terms_authorId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "id" integer PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY (sequence name "jobs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "termId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "definitionId" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "type" "job_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "status" "job_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isAdmin" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_termId_terms_id_fk" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "definitionEdits" ADD CONSTRAINT "definitionEdits_definitionId_definitions_id_fk" FOREIGN KEY ("definitionId") REFERENCES "public"."definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_termId_terms_id_fk" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_definitionId_definitions_id_fk" FOREIGN KEY ("definitionId") REFERENCES "public"."definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_jobs" ON "jobs" USING btree ("termId") WHERE "jobs"."status" = 'pending';--> statement-breakpoint
CREATE UNIQUE INDEX "unique_term_creation" ON "jobs" USING btree ("termId") WHERE "jobs"."type" = 'create';--> statement-breakpoint
ALTER TABLE "terms" DROP COLUMN "authorId";--> statement-breakpoint
ALTER TABLE "definitions" ADD CONSTRAINT "definitions_authorId_termId_unique" UNIQUE("authorId","termId");--> statement-breakpoint
ALTER TABLE "terms" ADD CONSTRAINT "terms_term_unique" UNIQUE("term");--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "revise_def_id" CHECK (("jobs"."type" in ('revise') and "jobs"."definitionId" is not null) or ("jobs"."type" not in ('revise')));