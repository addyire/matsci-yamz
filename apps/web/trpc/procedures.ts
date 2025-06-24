import { TRPCError } from "@trpc/server";
import { baseProcedure } from "./init";

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
