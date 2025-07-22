import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { DefineTermForm } from "./form";
import { HydrateClient, trpc } from "@/trpc/server";

export default async function AddTermPage() {
  // Get session and return to homepage if they aren't authenticated
  const sesh = await getSession();
  if (!sesh.id) redirect("/");

  trpc.terms.list.prefetch(undefined);

  return (
    <HydrateClient>
      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <h1 className="text-3xl font-bold leading-none">Define a Term</h1>
            <p className="text-secondary-foreground mt-2">
              Instructions will go here
            </p>
          </div>
          <DefineTermForm />
        </div>
      </main>
    </HydrateClient>
  );
}
