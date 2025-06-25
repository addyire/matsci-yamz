import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { authenticatedProcedure } from "../procedures";
import {
  db,
  definitionsTable,
  tagsTable,
  tagsToTerms,
  termsTable,
} from "@yamz/db";
import { and, eq, getTableColumns } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";

export const tagsRouter = createTRPCRouter({
  create: authenticatedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const [tag] = await db
        .insert(tagsTable)
        .values({ name: input.name })
        .returning();

      revalidatePath(`/tags`);

      return tag;
    }),
  get: baseProcedure
    .input(z.object({ definitionId: z.number() }))
    .query(async ({ input: { definitionId } }) => {
      return await db
        .select(getTableColumns(tagsTable))
        .from(tagsToTerms)
        .where(eq(tagsToTerms.definitionId, definitionId))
        .innerJoin(tagsTable, eq(tagsToTerms.tagId, tagsTable.id));
    }),
  // toggles a tag on a given term
  toggle: authenticatedProcedure
    .input(
      z.object({
        tagId: z.number(),
        definitionId: z.number(),
      }),
    )
    .mutation(async ({ ctx: { userId }, input: { definitionId, tagId } }) => {
      // find the term, and the relation if it exists
      const [definition] = await db
        .select({
          authorId: definitionsTable.authorId,
          exists: tagsToTerms.definitionId,
        })
        .from(definitionsTable)
        .leftJoin(
          tagsToTerms,
          and(
            eq(termsTable.id, tagsToTerms.definitionId),
            eq(tagsToTerms.tagId, tagId),
          ),
        )
        .where(eq(definitionsTable.id, definitionId))
        .limit(1);

      // if the term doesn't exist, throw an error
      if (!definition)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This term doesn't exist",
        });

      // if the user isn't the author, throw an error
      if (definition.authorId != userId)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not the owner of this term",
        });

      if (definition.exists)
        // relation exists - delete it
        await db
          .delete(tagsToTerms)
          .where(
            and(
              eq(tagsToTerms.definitionId, definitionId),
              eq(tagsToTerms.tagId, tagId),
            ),
          );
      else
        // relation doesn't exist - insert
        await db
          .insert(tagsToTerms)
          .values({ definitionId, tagId })
          .onConflictDoNothing();

      return { ok: true };
    }),
  getAll: baseProcedure.query(async () => {
    return await db.select().from(tagsTable);
  }),
  definitions: baseProcedure
    .input(z.object({ tagId: z.number() }))
    .query(async ({ input: { tagId } }) => {
      return await db
        .select({
          ...getTableColumns(definitionsTable),
          term: termsTable.term,
        })
        .from(tagsToTerms)
        .innerJoin(definitionsTable, eq(definitionsTable.id, tagsToTerms.definitionId))
        .innerJoin(termsTable, eq(termsTable.id, definitionsTable.termId))
        .where(eq(tagsToTerms.tagId, tagId));
    }),
});
