CREATE TYPE "public"."vote_type" AS ENUM('up', 'down');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"definitionId" integer NOT NULL,
	"userId" integer NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "definitions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "definitions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"termId" integer NOT NULL,
	"authorId" integer,
	"definition" text NOT NULL,
	"example" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "jobs" (

);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tagsToTerms" (
	"definitionId" integer NOT NULL,
	"tagId" integer NOT NULL,
	CONSTRAINT "tagsToTerms_tagId_definitionId_pk" PRIMARY KEY("tagId","definitionId")
);
--> statement-breakpoint
CREATE TABLE "terms" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "terms_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"authorId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"term" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"googleId" varchar,
	"name" varchar(255),
	"email" varchar(254),
	"isAi" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"notifications" boolean DEFAULT false,
	CONSTRAINT "users_googleId_unique" UNIQUE("googleId")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"definitionId" integer NOT NULL,
	"userId" integer NOT NULL,
	"kind" "vote_type" NOT NULL,
	CONSTRAINT "votes_definitionId_userId_pk" PRIMARY KEY("definitionId","userId")
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_definitionId_definitions_id_fk" FOREIGN KEY ("definitionId") REFERENCES "public"."definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "definitions" ADD CONSTRAINT "definitions_termId_terms_id_fk" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "definitions" ADD CONSTRAINT "definitions_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagsToTerms" ADD CONSTRAINT "tagsToTerms_definitionId_definitions_id_fk" FOREIGN KEY ("definitionId") REFERENCES "public"."definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagsToTerms" ADD CONSTRAINT "tagsToTerms_tagId_tags_id_fk" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "terms" ADD CONSTRAINT "terms_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_definitionId_definitions_id_fk" FOREIGN KEY ("definitionId") REFERENCES "public"."definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;