"use server";

import { getSession } from "@/lib/session";
import { db, votesTable, definitionsTable } from "@yamz/db";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type VoteState =
  | {
      score: number;
    }
  | { error: null | string };

export interface VoteArgs {
  definitionId: number;
  vote: "up" | "down";
}

export const VoteOnDefinition = async (
  _prev: VoteState,
  { definitionId, vote }: VoteArgs,
): Promise<VoteState> => {
  const { id: userId } = await getSession();
  if (!userId) return { error: "You must be logged in to perform this action" };

  const [updatedDefinition] = await db.transaction(async (tx) => {
    // constraint to select the vote from votes table
    const constraint = and(
      eq(votesTable.userId, userId),
      eq(votesTable.definitionId, definitionId),
    );

    const existing = await tx.query.votesTable.findFirst({
      where: constraint,
    });

    const value = (v: "up" | "down") => (v === "up" ? 1 : -1);

    // user changing their vote
    if (existing) {
      // if they voted the same thing, remove the vote
      if (existing.kind === vote) {
        await tx.delete(votesTable).where(constraint);
        return await tx
          .update(definitionsTable)
          .set({
            score: sql`${definitionsTable.score} - ${value(vote)}`,
          })
          .where(eq(definitionsTable.id, definitionId))
          .returning();
      } else {
        // otherwise, change the vote
        await tx.update(votesTable).set({ kind: vote }).where(constraint);
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

  revalidatePath(`/terms/${updatedDefinition.termId}`);
  revalidatePath(`/definitions/${updatedDefinition.id}`);

  return { score: updatedDefinition.score, ok: true };
};
