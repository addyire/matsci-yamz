import { createTRPCRouter } from "../init";
import { tagsRouter } from "./tags";
import { userRouter } from "./user";
import { definitionsRouter } from "./definitions";
import { commentsRouter } from "./comments";
import { jobsRouter } from "./jobs";

export const appRouter = createTRPCRouter({
  tags: tagsRouter,
  user: userRouter,
  definitions: definitionsRouter,
  comments: commentsRouter,
  jobs: jobsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
