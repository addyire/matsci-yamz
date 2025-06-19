import { z } from "zod";

export type DefineTerm = z.infer<typeof DefineTermSchema>;
export const DefineTermSchema = z.object({
  term: z.string().nonempty(),
  definition: z.string(),
  examples: z.string(),
});
