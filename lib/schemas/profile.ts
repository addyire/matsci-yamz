import { z } from "zod";

export type EditProfile = z.infer<typeof EditProfileSchema>;
export const EditProfileSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
});
