ALTER TABLE "definitionEdits" ADD COLUMN "newDefinition" text;--> statement-breakpoint
ALTER TABLE "definitionEdits" DROP COLUMN "prevDefinition";