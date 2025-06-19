import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const GET = async () => {
  // Get session
  const session = await getSession();

  session.destroy();
  await session.save();

  redirect("/");
};
