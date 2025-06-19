import { TermVotes, TermVotesFallback } from "@/components/term/votes";
import { Card } from "@/components/ui/card";
import { db, termsTable, usersTable } from "@yamz/db";
import { HydrateClient, trpc } from "@/trpc/server";
import { eq, getTableColumns, like, sql } from "drizzle-orm";
import { Suspense } from "react";
import { TermDefinition, TermMetadata } from "@/components/term/preview";

export default async function AlternateTermsPage(props: {
  params: Promise<{ term: string }>;
}) {
  const { term: rawTerm } = await props.params;
  const term = decodeURIComponent(rawTerm);

  const terms = await db
    .selectDistinct({
      ...getTableColumns(termsTable),
      author: {
        name: usersTable.name,
      },
    })
    .from(termsTable)
    .innerJoin(usersTable, eq(termsTable.authorId, usersTable.id))
    .where(like(sql`lower(${termsTable.term})`, term.toLowerCase()))
    .groupBy(termsTable.id, usersTable.name);

  terms.forEach((t) => trpc.votes.get.prefetch(t.id));

  return (
    <HydrateClient>
      <main className="px-4 p-8">
        <section className="max-w-4xl w-full mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            Alternate Definitions for {term}
          </h1>
          <div className="space-y-2">
            {terms.map((term) => (
              <Card key={term.id} className="flex-row p-4">
                <Suspense fallback={<TermVotesFallback />}>
                  <TermVotes id={term.id} />
                </Suspense>
                <TermDefinition term={term} />
                <TermMetadata term={term} author={term.author.name} />
              </Card>
            ))}
          </div>
        </section>
      </main>
    </HydrateClient>
  );
}
