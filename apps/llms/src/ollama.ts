import { Ollama } from "ollama";

export const ollama = new Ollama()

  // const ai = await ollama.chat({
  //   model: 'gemma3',
  //   messages: [{ role: 'user', content: 'Define: melt\n\nExample: The metal will melt at 400 degrees.' }],
  //   format: zodToJsonSchema(DefinitionOutput),
  //   keep_alive: 0,
  //   stream: true
  // })
