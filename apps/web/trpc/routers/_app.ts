import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { db, commentsTable, termsTable, usersTable, votesTable } from "@yamz/db";
import { eq, getTableColumns, sql } from "drizzle-orm";
import { authenticatedProcedure } from "../procedures";
import { revalidatePath } from "next/cache";
import { DefineTermSchema } from "@/lib/schemas/terms";
import { tagsRouter } from "./tags";

export const appRouter = createTRPCRouter({
  tags: tagsRouter,
  terms: {
    create: authenticatedProcedure
      .input(DefineTermSchema)
      .mutation(async ({ ctx: { userId }, input }) => {
        const [insertedTerm] = await db
          .insert(termsTable)
          .values({
            authorId: userId,
            ...input,
          })
          .returning();

        revalidatePath("/terms");
        revalidatePath(`/terms/alternates/${encodeURIComponent(input.term)}`);

        return insertedTerm!;
      }),
  },
  comments: {
    get: baseProcedure.input(z.number()).query(async ({ input: id }) => {
      const comments = await db
        .select({
          ...getTableColumns(commentsTable),
          author: {
            name: usersTable.name,
          },
        })
        .from(commentsTable)
        .where(eq(commentsTable.termId, id))
        .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id));

      return comments;
    }),
    create: authenticatedProcedure
      .input(z.object({ id: z.number(), comment: z.string().nonempty() }))
      .mutation(
        async ({
          input: { id: termId, comment: message },
          ctx: { userId },
        }) => {
          const [insertedComment] = await db
            .insert(commentsTable)
            .values({
              termId,
              userId,
              message,
            })
            .returning();

          return insertedComment;
        },
      ),
  },
  votes: {
    get: baseProcedure
      .input(z.number())
      .query(async ({ ctx: { session }, input: id }) => {
        const [score] = await db
          .select({
            // calculate the term score
            score: sql<number>`COALESCE(SUM(CASE WHEN ${votesTable.kind} = 'up' THEN 1 WHEN ${votesTable.kind} = 'down' THEN -1 ELSE 0 END), 0)`,
            // if the user is logged in, try to find the users vote for this term
            ...(session.id
              ? {
                userVote: sql<
                  "up" | "down" | null
                >`MAX(CASE WHEN ${votesTable.userId} = ${session.id} THEN ${votesTable.kind} ELSE NULL END)`,
              }
              : {}),
          })
          .from(votesTable)
          .where(eq(votesTable.termId, id));

        return score;
      }),
    vote: authenticatedProcedure
      .input(
        z.object({
          id: z.number(),
          vote: z.enum(["up", "down"]),
        }),
      )
      .mutation(async ({ ctx: { userId }, input: { id, vote } }) => {
        await db
          .insert(votesTable)
          .values({ termId: id, userId, kind: vote })
          .onConflictDoUpdate({
            target: [votesTable.termId, votesTable.userId],
            set: { kind: vote },
          });

        revalidatePath(`/terms/${id}`);
      }),
  },
});

// export type definition of API
export type AppRouter = typeof appRouter;
