import {
  commentsTable,
  db,
  definitionsTable,
  editsTable,
  jobsTable,
  usersTable,
} from "@yamz/db";
import { and, asc, eq, sql } from "drizzle-orm";
import { unionAll } from "drizzle-orm/pg-core";
import { cache } from "react";

export const GetUser = cache((userId: number) =>
  db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  }),
);

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

export const DefinitionHistory = async (definitionId: number) => {
  const commentsQ = db
    .select({
      type: sql<"comment" | "edit">`'comment'`.as("type"),
      id: commentsTable.id,
      body: commentsTable.message,
      createdAt: commentsTable.createdAt,
    })
    .from(commentsTable)
    .where(eq(commentsTable.definitionId, definitionId));

  const editsQ = db
    .select({
      type: sql<"edit" | "comment">`'edit'`.as("type"),
      id: editsTable.id,
      body: editsTable.definition,
      createdAt: editsTable.editedAt,
    })
    .from(editsTable)
    .where(eq(editsTable.definitionId, definitionId));

  const timelineQ = unionAll(commentsQ, editsQ).as("timeline");

  const timeline = await db
    .select()
    .from(timelineQ)
    .orderBy(asc(timelineQ.createdAt));

  return timeline;
};
