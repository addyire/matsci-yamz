import { chatsTable, db, termsTable } from "@yamz/db";
import { createTRPCRouter } from "../init";
import { adminProcedure } from "../procedures";
import { ollama, OllamaModel, reviseDefinition, runLLM } from "@/lib/apis/ollama";
import { z } from "zod";
import { asc, desc, eq, sql } from "drizzle-orm";
import { UpsertAIDefinition } from "@/lib/crud";
import { revalidatePath } from "next/cache";

export const adminRouter = createTRPCRouter({
  ollama: adminProcedure.query(async () => {
    const x = await ollama.show({ model: OllamaModel })

    return x
  }),
  chats: adminProcedure.input(z.number()).query(async ({ input: termId }) => {
    return await db.query.chatsTable.findMany({
      where: eq(chatsTable.termId, termId),
    });
  }),
  terms: adminProcedure.query(async () => {
    const chatsQ = db
      .select()
      .from(chatsTable)
      .limit(1)
      .where(eq(chatsTable.termId, termsTable.id))
      .orderBy(desc(chatsTable.createdAt))
      .as("chats");

    const x = await db
      .select({
        id: termsTable.id,
        term: termsTable.term,
        pending: sql<boolean>`${chatsQ.role} = 'user'`.as("pending"),
      })
      .from(termsTable)
      .leftJoinLateral(chatsQ, sql`TRUE`);

    return x;
  }),
  run: adminProcedure.input(z.number()).mutation(async ({ input: termId }) => {
    const { insertedChat } = await reviseDefinition(termId)

    return insertedChat;
  }),
});
