import { db, jobsTable } from "@yamz/db";
import { createTRPCRouter } from "../init";
import { adminProcedure } from "../procedures";
import { ollama } from "@/lib/apis/ollama";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { DefinitionHistory } from "@/lib/crud";

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
  run: adminProcedure.input(z.number()).mutation(async ({ input: jobId }) => {
    const job = await db.query.jobsTable.findFirst({
      where: eq(jobsTable.id, jobId),
    });

    const history = await DefinitionHistory(jobId);

    console.log(job, history);
  }),
});

export const adminRouter = createTRPCRouter({
  jobs: jobsRouter,
  ollama: {
    models: adminProcedure.query(async () => {
      const { models } = await ollama.list();

      return models;
    }),
  },
});
