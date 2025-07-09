import { createTRPCRouter } from "../init";
import { tagsRouter } from "./tags";
import { userRouter } from "./user";
import { definitionsRouter } from "./definitions";
import { commentsRouter } from "./comments";
import { adminRouter, jobsRouter } from "./jobs";
import { termsRouter } from "./terms";

export const appRouter = createTRPCRouter({
  tags: tagsRouter,
  user: userRouter,
  definitions: definitionsRouter,
  terms: termsRouter,
  comments: commentsRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
