import { db, definitionsTable, jobsTable, usersTable } from "@yamz/db";
import { and, asc, eq } from "drizzle-orm";

export const GetAiUser = async () => {
  let aiUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.isAi, true),
  });

  if (!aiUser) {
    console.log("No AI user found! Creating one now...");

    const [insertedUser] = await db
      .insert(usersTable)
      .values({
        isAi: true,
      })
      .returning();

    aiUser = insertedUser;
  } else console.log(`Using AI user with id ${aiUser.id}`);

  return aiUser;
};

export type CreateJob = Awaited<ReturnType<typeof GetJobs>>[number];
export const GetJobs = (type: "create" | "revise") =>
  db.query.jobsTable.findMany({
    where: and(eq(jobsTable.type, type), eq(jobsTable.status, "pending")),
    with: {
      term: {
        with: {
          definitions: {
            limit: 1,
            orderBy: asc(definitionsTable.createdAt),
          },
        },
      },
    },
  });

export const SetJobStatus = (
  id: number,
  status: "in_progress" | "succeeded" | "failed",
  definitionId?: number,
) =>
  db
    .update(jobsTable)
    .set({ status, definitionId })
    .where(eq(jobsTable.id, id));
