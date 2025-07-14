import { chatsTable, db, termsTable } from "@yamz/db";
import { createTRPCRouter } from "../init";
import { adminProcedure } from "../procedures";
import { runLLM } from "@/lib/apis/ollama";
import { z } from "zod";
import { asc, desc, eq, sql } from "drizzle-orm";
import { UpsertAIDefinition } from "@/lib/crud";
import { revalidatePath } from "next/cache";

export const adminRouter = createTRPCRouter({
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
    const chats = await db.query.chatsTable.findMany({
      where: eq(chatsTable.termId, termId),
      orderBy: asc(chatsTable.createdAt),
    });

    const lastChat = chats[chats.length - 1];
    if (lastChat.role !== "user") return; // dont run if last message was from ai

    const result = await runLLM(
      chats.map((chat) => ({ role: chat.role, content: chat.message })),
    );
    if (!result) throw new Error("Something went wrong");

    await UpsertAIDefinition(termId, result);

    const [insertedChat] = await db
      .insert(chatsTable)
      .values({
        role: "system",
        message: `<definition>\n${result?.definition}\n\n<example>\n${result.example}`,
        termId,
      })
      .returning();

    revalidatePath(`/admin/jobs/${termId}`);

    return insertedChat;
  }),
});
