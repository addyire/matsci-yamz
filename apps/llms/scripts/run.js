import { commentsTable, db, definitionsTable, editsTable, jobsTable, } from "@yamz/db";
import { LLMCreateDefPrompt, runLLM } from "../src/ollama";
import { GetAiUser, GetJobs, SetJobStatus } from "../src/crud";
import { asc, eq, sql } from "drizzle-orm";
import { unionAll } from "drizzle-orm/pg-core";
const main = async () => {
    const aiUser = await GetAiUser();
    // fetch all create jobs
    const createJobs = await GetJobs("create");
    console.log(`Loaded ${createJobs.length} create jobs...`);
    // process each job
    for (const job of createJobs) {
        console.log(`===> STARTING JOB ${job.id}`);
        // mark job as in-progress
        await SetJobStatus(job.id, "in_progress");
        // Create the message we will send to the LLM
        const prompt = LLMCreateDefPrompt(job);
        console.log(`-- PROMPT --`);
        console.log(prompt);
        const result = await runLLM([
            {
                role: "user",
                content: prompt,
            },
        ]);
        console.log("-- RESULT --");
        console.log(result);
        if (!result) {
            await SetJobStatus(job.id, "failed");
            continue;
        }
        console.log(`Inserting into database...`);
        const [insertedDefinition] = await db
            .insert(definitionsTable)
            .values({
            ...result,
            authorId: aiUser.id,
            termId: job.termId,
        })
            .returning();
        // insert the definition to our definition history table
        await db.insert(editsTable).values({
            prevDefinition: null,
            definition: result.definition,
            definitionId: insertedDefinition.id,
        });
        await SetJobStatus(job.id, "succeeded", insertedDefinition.id);
    }
    const revisionJobs = await GetJobs("revise");
    for (const job of revisionJobs) {
        const aiDefinitionId = job.definitionId;
        const commentsQ = db
            .select({
            type: sql `'comment'`.as("type"),
            id: commentsTable.id,
            body: commentsTable.message,
            createdAt: commentsTable.createdAt,
        })
            .from(commentsTable)
            .where(eq(commentsTable.definitionId, aiDefinitionId));
        const editsQ = db
            .select({
            type: sql `'edit'`.as("type"),
            id: editsTable.id,
            body: editsTable.definition,
            createdAt: editsTable.editedAt,
        })
            .from(editsTable)
            .where(eq(editsTable.definitionId, aiDefinitionId));
        const timelineQ = unionAll(commentsQ, editsQ).as("timeline");
        const timeline = await db
            .select()
            .from(timelineQ)
            .orderBy(asc(timelineQ.createdAt));
        const messages = [
            {
                role: "user",
                content: LLMCreateDefPrompt(job),
            },
            ...timeline.map(({ type, body }) => ({
                role: type === "edit" ? "assistant" : "user",
                content: type === "comment" ? "Comment: " + body : body,
            })),
        ];
        console.log("Messages", messages);
        const result = await runLLM(messages);
        if (!result)
            throw new Error("something went wrong");
        console.log("Result");
        console.log(result);
        await db.transaction(async (tx) => {
            const currentDef = await tx.query.definitionsTable.findFirst({
                where: eq(definitionsTable.id, aiDefinitionId),
            });
            await tx.insert(editsTable).values({
                definition: result.definition,
                definitionId: aiDefinitionId,
                prevDefinition: currentDef.definition,
            });
            await tx
                .update(definitionsTable)
                .set({ definition: result.definition })
                .where(eq(definitionsTable.id, aiDefinitionId));
            await tx
                .update(jobsTable)
                .set({ status: "succeeded" })
                .where(eq(jobsTable.id, job.id));
        });
    }
    // const context = await db.query.termsTable.findMany({
    //   where: (tt, { eq }) => eq(tt.term, term),
    //   with: {
    //     comments: true,
    //     votes: true,
    //   },
    // });
    //
    // let str = `Define: ${term}\n\n`;
    //
    // for (let i = 0; i < context.length; i++) {
    //   str += `-- Example ${i + 1} --\n`;
    //
    //   const def = context[i];
    //
    //   str += def.examples + "\n\n";
    // }
    //
    // console.log(`Context:\n\n${str}`);
    //
    // const ai = await ollama.chat({
    //   model: "gemma3",
    //   messages: [{ role: "user", content: str }],
    //   format: zodToJsonSchema(DefinitionOutput),
    // });
    //
    // const data = JSON.parse(ai.message.content) as DefinitionOutput;
    //
    // console.log(`== MODEL OUTPUT ==`);
    // console.log(data);
};
main();
