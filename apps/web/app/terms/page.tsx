import { db, termsTable } from "@yamz/db";
import { sql } from "drizzle-orm";
import Link from "next/link";

export default async function TermsPage() {
  const terms = await db
    .select({
      term: sql<string>`lower(${termsTable.term})`.as("lwr_term"),
      count: sql<number>`count(*)`,
      definitions: sql`array_agg(${termsTable.definition})`,
    })
    .from(termsTable)
    .groupBy(sql`lwr_term`);

  return (
    <main className="px-4 py-8 max-w-2xl w-full mx-auto">
      <h1 className="text-2xl font-bold">Browse Terms</h1>
      <section className="divide-y divide-gray-500">
        {terms.map(({ term, count }) => (
          <div key={term} className="text-xl">
            <Link className="text-blue-500" href={`/terms/alternates/${term}`}>
              {term} - {count}
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
}
