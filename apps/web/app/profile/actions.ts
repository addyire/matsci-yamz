"use server";
import { db, usersTable } from "@yamz/db";
import { EditProfile, EditProfileSchema } from "@/lib/schemas/profile";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";

export const submitProfile = async (data: EditProfile) => {
  const sesh = await getSession();
  if (!sesh.id) return { ok: false, message: "You must be logged in" };

  const parser = EditProfileSchema.safeParse(data);
  if (!parser.success) return { ok: false, message: "Invalid data" };

  await db
    .update(usersTable)
    .set({ name: data.name, email: data.email })
    .where(eq(usersTable.id, sesh.id));

  return { ok: true };
};
