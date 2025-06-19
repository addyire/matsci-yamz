import { db, usersTable } from "@yamz/db";
import { oauth } from "@/lib/apis/google";
import { getSession } from "@/lib/session";
import { google } from "googleapis";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  // Get session
  const session = await getSession();

  // Get the OAuth code from url params
  const code = req.nextUrl.searchParams.get("code");
  if (!code) redirect("/");

  // Get google token from oauth code
  const token = await oauth.getToken(code);
  oauth.setCredentials(token.tokens);

  // Get user info with oauth credentials
  const userInfo = await google
    .oauth2({ version: "v2", auth: oauth })
    .userinfo.get();
  const { id: userId, name, email } = userInfo.data;
  if (!userId || !email)
    throw new Error("Didn't get sufficient user info from Google!");

  // Upsert the user in the database (Insert if doesn't exist and return the row)
  const [user] = await db
    .insert(usersTable)
    .values({ googleId: userId, name: name || "", email })
    .onConflictDoUpdate({
      target: usersTable.googleId,
      set: { googleId: userId },
    })
    .returning();

  // Save id in session for future requests
  session.id = user!.id;
  await session.save();

  // Redirect to profile page
  redirect("/profile");
};
