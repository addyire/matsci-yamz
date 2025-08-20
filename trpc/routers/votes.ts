import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { authenticatedProcedure } from "../procedures";
import { db, definitionsTable, votesTable } from "@yamz/db";
import { and, eq, sql } from "drizzle-orm";

export const votesRouter = createTRPCRouter({
  get: baseProcedure
    .input(z.object({ definitionId: z.number() }))
    .query(async ({ ctx: { userId }, input: { definitionId } }) => {
      const [data] = await db
        .select({
          score: sql<number>`SUM(CASE WHEN ${votesTable.kind} = 'up' THEN 1 ELSE -1 END)`,
          vote: userId
            ? sql<"up" | "down" | null>`MAX(CASE WHEN ${votesTable.userId} = ${userId} THEN ${votesTable.kind} ELSE NULL END)`.as('vote')
            : sql<"up" | "down" | null>`null`.as("vote"),
        })
        .from(votesTable)
        .where(eq(votesTable.definitionId, definitionId))

      return data
    }),
  vote: authenticatedProcedure
    .input(z.object({ definitionId: z.number(), vote: z.enum(['up', 'down']) }))
    .mutation(async ({ ctx: { userId }, input: { definitionId, vote } }) => {
      const [updatedDefinition] = await db.transaction(async (tx) => {
        // constraint to select the vote from votes table
        const votesTableConstraint = and(
          eq(votesTable.userId, userId),
          eq(votesTable.definitionId, definitionId),
        );

        const existing = await tx.query.votesTable.findFirst({
          where: votesTableConstraint,
        });

        const value = (v: "up" | "down") => (v === "up" ? 1 : -1);

        // user changing their vote
        if (existing) {
          // if they voted the same thing, remove the vote
          if (existing.kind === vote) {
            await tx.delete(votesTable).where(votesTableConstraint);
            return await tx
              .update(definitionsTable)
              .set({
                score: sql`${definitionsTable.score} - ${value(vote)}`,
              })
              .where(eq(definitionsTable.id, definitionId))
              .returning();
          } else {
            // otherwise, change the vote
            await tx.update(votesTable).set({ kind: vote }).where(votesTableConstraint);

            return await tx
              .update(definitionsTable)
              .set({
                score: sql`${definitionsTable.score} + ${value(vote) - value(existing.kind)}`,
              })
              .where(eq(definitionsTable.id, definitionId))
              .returning();
          }
        } else {
          // insert a new vote
          await tx.insert(votesTable).values({
            userId,
            definitionId,
            kind: vote,
          });

          return await tx
            .update(definitionsTable)
            .set({ score: sql`${definitionsTable.score} + ${value(vote)}` })
            .where(eq(definitionsTable.id, definitionId))
            .returning();
        }
      });

      return { score: updatedDefinition.score, ok: true };
    }),
})
