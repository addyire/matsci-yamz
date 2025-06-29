import { TRPCError } from "@trpc/server";
import { baseProcedure } from "./init";
import { db, usersTable } from "@yamz/db";
import { eq } from "drizzle-orm";
import { GetUser } from "@/lib/crud";

export const authenticatedProcedure = baseProcedure.use((opts) => {
  if (!opts.ctx.userId)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });

  return opts.next({
    ctx: {
      userId: opts.ctx.userId!,
    },
  });
});

export const adminProcedure = baseProcedure.use(async (opts) => {
  if (!opts.ctx.userId)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });

  const user = await GetUser(opts.ctx.userId);

  if (!user?.isAdmin)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });

  return opts.next({
    ctx: {
      userId: opts.ctx.userId!,
    },
  });
});
