import { baseProcedure, createTRPCRouter } from "../init";
import { tagsRouter } from "./tags";
import { userRouter } from "./user";
import { definitionsRouter } from "./definitions";
import { commentsRouter } from "./comments";
import { adminRouter } from "./admin";
import { termsRouter } from "./terms";
import { z } from "zod";
import { db, definitionsTable, termsTable, usersTable } from "@yamz/db";
import { desc, eq, ilike, or } from "drizzle-orm";
import { authenticatedProcedure } from "../procedures";
import { votesRouter } from "./votes";

export const appRouter = createTRPCRouter({
  tags: tagsRouter,
  user: userRouter,
  definitions: definitionsRouter,
  votes: votesRouter,
  terms: termsRouter,
  comments: commentsRouter,
  admin: adminRouter,
  me: authenticatedProcedure.query(async ({ ctx }) => {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, ctx.userId),
    });

    return user;
  }),
  logout: baseProcedure.mutation(async ({ ctx }) => {
    ctx.session.destroy()
    await ctx.session.save()

    return { ok: true }
  }),
  search: baseProcedure.input(z.object({ query: z.string(), limit: z.number().default(10) }).optional()).query(async ({ input }) => {
    const { query, limit } = input || { query: '', limit: 10 }

    const results = await db
      .select()
      .from(termsTable)
      .innerJoin(definitionsTable, eq(termsTable.id, definitionsTable.termId))
      .where(
        or(
          ilike(termsTable.term, `%${query}%`),
          ilike(definitionsTable.definition, `%${query}%`),
        ),
      )
      .limit(limit)
      .orderBy(desc(definitionsTable.createdAt));

    return results;
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
