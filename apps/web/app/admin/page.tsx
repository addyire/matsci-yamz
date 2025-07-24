import { HydrateClient, trpc } from "@/trpc/server";
import { JobsTable } from "./table";
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation";
import { TestOllama } from "./ollama";

export default async function AdminPage() {
  const { user } = await auth()
  if (!user?.isAdmin) redirect('/')

  await trpc.admin.terms.prefetch();
  await trpc.admin.ollama.prefetch();

  return (
    <HydrateClient>
      <main className="max-w-2xl w-full mx-auto my-4 space-y-2">
        <TestOllama />
        <h1 className="text-4xl font-semibold">Terms</h1>
        <JobsTable />
      </main>
    </HydrateClient>
  );
}
