import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import {
  db,
  commentsTable,
  termsTable,
  usersTable,
  votesTable,
  definitionsTable,
} from "@yamz/db";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { authenticatedProcedure } from "../procedures";
import { revalidatePath } from "next/cache";
import { DefineTermSchema } from "@/lib/schemas/terms";
import { tagsRouter } from "./tags";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  tags: tagsRouter,
  user: userRouter,
  definitions: {
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
  },
  terms: {
    create: authenticatedProcedure
      .input(DefineTermSchema)
      .mutation(async ({ ctx: { userId: authorId }, input }) => {
        const result = await db.transaction(async (tx) => {
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

          return { term: insertedTerm, definition: insertedDefinition };
        });

        revalidatePath("/terms");
        revalidatePath(`/terms/alternates/${encodeURIComponent(input.term)}`);

        return result;
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
        .where(eq(commentsTable.definitionId, id))
        .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id));

      return comments;
    }),
    create: authenticatedProcedure
      .input(z.object({ id: z.number(), comment: z.string().nonempty() }))
      .mutation(async ({ input: { id, comment }, ctx: { userId } }) => {
        const [insertedComment] = await db
          .insert(commentsTable)
          .values({
            definitionId: id,
            userId,
            message: comment,
          })
          .returning();

        return insertedComment;
      }),
  },
  votes: {
    vote: authenticatedProcedure
      .input(
        z.object({
          definitionId: z.number(),
          vote: z.enum(["up", "down"]),
        }),
      )
      .mutation(
        async ({ ctx: { userId }, input: { definitionId, vote } }) => {},
      ),
  },
});

// export type definition of API
export type AppRouter = typeof appRouter;
