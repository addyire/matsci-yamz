import commandLineArgs from "command-line-args";
import { db } from "@yamz/db";
import { ollama } from "../src/ollama";
import zodToJsonSchema from "zod-to-json-schema";
import { DefinitionOutput } from "../src/outputs";

const options = commandLineArgs([
  {
    name: "term",
    type: String,
    alias: "t",
  },
]);

const main = async () => {
  const term = options.term as string;

  console.log(`Generating context for ${term}...`);

  const context = await db.query.termsTable.findMany({
    where: (tt, { eq }) => eq(tt.term, term),
    with: {
      comments: true,
      votes: true,
    },
  });

  let str = `Define: ${term}\n\n`;

  for (let i = 0; i < context.length; i++) {
    str += `-- Example ${i + 1} --\n`;

    const def = context[i];

    str += def.examples + "\n\n";
  }

  console.log(`Context:\n\n${str}`);

  const ai = await ollama.chat({
    model: "gemma3",
    messages: [{ role: "user", content: str }],
    format: zodToJsonSchema(DefinitionOutput),
  });

  const data = JSON.parse(ai.message.content) as DefinitionOutput;

  console.log(`== MODEL OUTPUT ==`);
  console.log(data);
};

main();
