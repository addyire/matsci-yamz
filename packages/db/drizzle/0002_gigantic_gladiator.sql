CREATE TABLE "tags" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tagsToTerms" (
	"termId" integer NOT NULL,
	"tagId" integer NOT NULL,
	CONSTRAINT "tagsToTerms_tagId_termId_pk" PRIMARY KEY("tagId","termId")
);
--> statement-breakpoint
ALTER TABLE "tagsToTerms" ADD CONSTRAINT "tagsToTerms_termId_terms_id_fk" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagsToTerms" ADD CONSTRAINT "tagsToTerms_tagId_tags_id_fk" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;