import { trpc } from "@/trpc/server";
import { auth } from "@/lib/auth";
import { Definition } from "@/components/definition";

export default async function ProfileTermsPage() {
  await auth();

  const definitions = await trpc.definitions.mine();

  return (
    <main className="max-w-2xl w-full mx-auto py-6">
      <h1 className="text-2xl font-semibold">Your Definitions</h1>
      {definitions.map((definition) => (
        <Definition key={definition.id} definition={definition}>
          <h2 className="text-xl font-medium">{definition.term.term}</h2>
        </Definition>
      ))}
    </main>
  );
}
