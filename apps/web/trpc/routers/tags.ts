import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { authenticatedProcedure } from "../procedures";
import { db, tagsTable, tagsToTerms, termsTable } from "@yamz/db";
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
    .input(z.object({ termId: z.number() }))
    .query(async ({ input: { termId } }) => {
      return await db
        .select(getTableColumns(tagsTable))
        .from(tagsToTerms)
        .where(eq(tagsToTerms.termId, termId))
        .innerJoin(tagsTable, eq(tagsToTerms.tagId, tagsTable.id));
    }),
  // toggles a tag on a given term
  toggle: authenticatedProcedure
    .input(
      z.object({
        tagId: z.number(),
        termId: z.number(),
      }),
    )
    .mutation(async ({ ctx: { userId }, input: { termId, tagId } }) => {
      // find the term, and the relation if it exists
      const [term] = await db
        .select({
          authorId: termsTable.authorId,
          exists: tagsToTerms.termId,
        })
        .from(termsTable)
        .leftJoin(
          tagsToTerms,
          and(
            eq(termsTable.id, tagsToTerms.termId),
            eq(tagsToTerms.tagId, tagId),
          ),
        )
        .where(eq(termsTable.id, termId))
        .limit(1);

      // if the term doesn't exist, throw an error
      if (!term)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This term doesn't exist",
        });

      // if the user isn't the author, throw an error
      if (term.authorId != userId)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not the owner of this term",
        });

      if (term.exists)
        // relation exists - delete it
        await db
          .delete(tagsToTerms)
          .where(
            and(eq(tagsToTerms.termId, termId), eq(tagsToTerms.tagId, tagId)),
          );
      else
        // relation doesn't exist - insert
        await db
          .insert(tagsToTerms)
          .values({ termId, tagId })
          .onConflictDoNothing();

      return { ok: true };
    }),
  getAll: baseProcedure.query(async () => {
    return await db.select().from(tagsTable);
  }),
});
