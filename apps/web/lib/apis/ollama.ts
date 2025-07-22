import { Message, Ollama } from "ollama";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

type DefinitionOutput = z.infer<typeof DefinitionOutput>;
const DefinitionOutput = z.object({
  definition: z.string(),
  example: z.string(),
});

export const LLMSystemPrompt = `You are to define material science terms. Keep definitions concise and don't be conversational, just respond with a definition and an example using the term with the given definition.`;

export const ollama = new Ollama({
  host: process.env.OLLAMA_HOST,
});

export const runLLM = async (messages: Message[]) => {
  const res = await ollama.chat({
    model: "gemma3",
    messages: [{ role: "system", content: LLMSystemPrompt }, ...messages],
    format: zodToJsonSchema(DefinitionOutput),
    // Make's sure model doesn't stop running until 5 seconds after our last request
    keep_alive: 5,
    think: false,
  });

  try {
    const raw = JSON.parse(res.message.content);
    const data = DefinitionOutput.parse(raw);

    return data;
  } catch (err) {
    console.log(JSON.stringify(res, null, 2));
    console.error("Model returned an invalid response", err);
  }
};
