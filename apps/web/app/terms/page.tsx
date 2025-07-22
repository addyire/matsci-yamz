import { db, definitionsTable, termsTable } from "@yamz/db";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";

export default async function TermsPage() {
  const terms = await db
    .select({
      term: termsTable.term,
      id: termsTable.id,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(definitionsTable)
    .leftJoin(termsTable, eq(termsTable.id, definitionsTable.termId))
    .groupBy(termsTable.term, termsTable.id);

  return (
    <main className="px-4 py-8 max-w-2xl w-full mx-auto">
      <h1 className="text-2xl font-bold">Browse Terms</h1>
      <section className="divide-y divide-gray-500">
        {terms.map(({ term, count, id }) => (
          <div key={term} className="text-xl">
            <Link className="text-blue-500" href={`/terms/${id}`}>
              {term} - {count}
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
}
