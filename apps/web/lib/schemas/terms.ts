import { z } from "zod";

export type DefineTerm = z.infer<typeof DefineTermSchema>;
export const DefineTermSchema = z.object({
  term: z.string().nonempty("Term is required"),
  definition: z.string().nonempty("You must give a definition"),
  examples: z.string().nonempty("You must give an example"),
});
