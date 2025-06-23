import { z } from "zod";

export type DefinitionOutput = z.infer<typeof DefinitionOutput>
export const DefinitionOutput = z.object({
  definition: z.string()
})
