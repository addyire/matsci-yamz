import { db, termsTable } from "@yamz/db";
import { HydrateClient, trpc } from "@/trpc/server";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DefinitionList } from "./definitions";

export default async function AlternateTermsPage(props: {
  params: Promise<{ termId: string }>;
}) {
  const { termId } = await props.params;

  const term = await db.query.termsTable.findFirst({
    where: eq(termsTable.id, Number(termId)),
  });

  if (!term) notFound();

  trpc.definitions.list.prefetch({ termId: term.id });

  return (
    <HydrateClient>
      <main className="px-4 p-8">
        <section className="max-w-4xl w-full mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            Alternate Definitions for {term.term}
          </h1>
          <div className="space-y-2">
            <DefinitionList termId={term.id} />
          </div>
        </section>
      </main>
    </HydrateClient>
  );
}
