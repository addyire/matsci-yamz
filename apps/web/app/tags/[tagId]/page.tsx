import { TermDefinition } from "@/components/term/preview";
import { Card } from "@/components/ui/card";
import { db, tagsTable, tagsToTerms, termsTable } from "@yamz/db";
import { eq } from "drizzle-orm";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tagId: string }>;
}) {
  const tagId = Number((await params).tagId);

  const [tag] = await db
    .select()
    .from(tagsTable)
    .where(eq(tagsTable.id, tagId))
    .limit(1);
  const terms = await db
    .select()
    .from(tagsToTerms)
    .innerJoin(termsTable, eq(termsTable.id, tagsToTerms.termId))
    .where(eq(tagsToTerms.tagId, tagId));

  return (
    <main className="max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold">Terms Tagged with {tag.name}</h1>
      {terms.map((t) => (
        <Card key={t.terms.id}>
          <TermDefinition term={t.terms} />
        </Card>
      ))}
    </main>
  );
}
