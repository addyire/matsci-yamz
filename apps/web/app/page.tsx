import { Button } from "@/components/ui/button";
import { db, usersTable } from "@yamz/db";
import { OAuthURL } from "@/lib/apis/google";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";

const AuthSection = async () => {
  const sesh = await getSession();
  if (sesh.id) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, sesh.id));

    return (
      <section>
        <p>You are currently logged in as {user!.name}</p>
        <Link href="/api/auth/logout" prefetch={false}>
          <Button>Log Out</Button>
        </Link>
      </section>
    );
  }

  return (
    <Link href={OAuthURL}>
      <Button>Login with Google</Button>
    </Link>
  );
};

export default async function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-8 gap-2">
      <h1 className="text-4xl font-semibold">Welcome to the MatSci YAMZ</h1>
      <Suspense fallback={null}>
        <AuthSection />
      </Suspense>
    </main>
  );
}
