import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const GET = async () => {
  // Get session
  const session = await getSession();

  session.destroy();
  await session.save();

  revalidatePath("/", "layout");
  redirect("/");
};
