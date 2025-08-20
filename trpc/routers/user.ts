import { EditProfileSchema } from "@/lib/schemas/profile";
import { createTRPCRouter } from "../init";
import { authenticatedProcedure } from "../procedures";
import { db, usersTable } from "@yamz/db";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  edit: authenticatedProcedure
    .input(EditProfileSchema)
    .mutation(async ({ input: data, ctx: { userId } }) => {
      await db
        .update(usersTable)
        .set({ name: data.name, email: data.email })
        .where(eq(usersTable.id, userId));

      return { ok: true };
    }),
});
