import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import {
  db,
  termsTable,
  votesTable,
  definitionsTable,
  editsTable,
  jobsTable,
} from "@yamz/db";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { authenticatedProcedure } from "../procedures";
import { revalidatePath } from "next/cache";

export const definitionsRouter = createTRPCRouter({
  create: authenticatedProcedure
    .input(
      z.object({
        term: z.string().nonempty("Term is required"),
        definition: z.string().nonempty("You must give a definition"),
        examples: z.string().nonempty("You must give an example"),
      }),
    )
    .mutation(async ({ ctx: { userId: authorId }, input }) => {
      const { term, definition } = await db.transaction(async (tx) => {
        // normalize the term
        const term = input.term.trim().toLowerCase();

        const [insertedTerm] = await tx
          .insert(termsTable)
          .values({ term })
          .onConflictDoUpdate({
            target: [termsTable.term],
            set: { term },
          })
          .returning();

        const [insertedDefinition] = await tx
          .insert(definitionsTable)
          .values({
            termId: insertedTerm.id,
            authorId,
            definition: input.definition,
            example: input.examples,
          })
          .returning();

        // insert the edit
        await tx.insert(editsTable).values({
          definition: input.definition,
          definitionId: insertedDefinition.id,
        });

        // create job for LLM
        await tx
          .insert(jobsTable)
          .values({ termId: insertedTerm.id, type: "create" })
          .onConflictDoNothing(); // dont if a create job already exists

        return { term: insertedTerm, definition: insertedDefinition };
      });

      revalidatePath("/terms");
      revalidatePath(`/terms/${term.id}`);

      return { term, definition };
    }),
  edit: authenticatedProcedure
    .input(
      z.object({
        id: z.number(),
        definition: z.string(),
        example: z.string(),
      }),
    )
    .mutation(
      async ({ ctx: { userId }, input: { id, definition, example } }) => {
        const res = await db.transaction(async (tx) => {
          const where = and(
            eq(definitionsTable.authorId, userId),
            eq(definitionsTable.id, id),
          );

          // find the old definition
          const def = await db.query.definitionsTable.findFirst({
            where,
          });

          if (!def) throw new Error("Definition doesn't exist");

          // update it
          const [updatedDef] = await tx
            .update(definitionsTable)
            .set({ definition, example })
            .where(where)
            .returning();

          await db.insert(editsTable).values({
            definitionId: def.id,
            definition: def.definition,
          });

          return updatedDef;
        });

        return res;
      },
    ),
  get: baseProcedure
    .input(z.object({ definitionId: z.number() }))
    .query(async ({ ctx: { userId }, input: { definitionId } }) => {
      const definitionsQuery = db
        .select({
          ...getTableColumns(definitionsTable),
          term: termsTable.term,
          vote: userId
            ? sql<"up" | "down" | null>`${votesTable.kind}`.as("vote")
            : sql<"up" | "down" | null>`null`.as("vote"),
        })
        .from(definitionsTable)
        .where(eq(definitionsTable.id, definitionId))
        .innerJoin(termsTable, eq(termsTable.id, definitionsTable.termId));

      if (userId)
        definitionsQuery.leftJoin(
          votesTable,
          and(
            eq(votesTable.userId, userId),
            eq(votesTable.definitionId, definitionsTable.id),
          ),
        );

      const [def] = await definitionsQuery;

      return def;
    }),
  list: baseProcedure
    .input(z.object({ termId: z.number() }))
    .query(async ({ ctx: { userId }, input: { termId } }) => {
      const definitionsQuery = db
        .select({
          ...getTableColumns(definitionsTable),
          vote: userId
            ? sql<"up" | "down" | null>`${votesTable.kind}`.as("vote")
            : sql<"up" | "down" | null>`null`.as("vote"),
        })
        .from(definitionsTable)
        .where(eq(definitionsTable.termId, termId))
        .orderBy(desc(definitionsTable.score));

      if (userId)
        definitionsQuery.leftJoin(
          votesTable,
          and(
            eq(votesTable.userId, userId),
            eq(votesTable.definitionId, definitionsTable.id),
          ),
        );

      return await definitionsQuery;
    }),
});
