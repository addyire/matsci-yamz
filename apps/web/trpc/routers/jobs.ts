import { db } from "@yamz/db";
import { createTRPCRouter } from "../init";
import { adminProcedure } from "../procedures";

export const jobsRouter = createTRPCRouter({
  get: adminProcedure.query(async () => {
    const jobs = await db.query.jobsTable.findMany({
      with: {
        definition: true,
        term: true,
      },
    });

    return jobs;
  }),
});
