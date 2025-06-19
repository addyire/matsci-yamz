import { EditTags } from "@/components/tags/selector";
import { TermTags, TermTagsFallback } from "@/components/tags/tags";
import { TermCommentBox } from "@/components/term/comment-box";
import { TermComments } from "@/components/term/comments";
import { TermMetadata } from "@/components/term/preview";
import { TermVotes, TermVotesFallback } from "@/components/term/votes";
import { db, termsTable, usersTable } from "@yamz/db";
import { getSession } from "@/lib/session";
import { HydrateClient, trpc } from "@/trpc/server";
import { eq, getTableColumns } from "drizzle-orm";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function TermPage(props: {
  params: Promise<{ termId: string }>;
}) {
  const sesh = await getSession();
  const { termId } = await props.params;

  trpc.votes.get.prefetch(Number(termId));
  trpc.comments.get.prefetch(Number(termId));
  trpc.tags.get.prefetch({ termId: Number(termId) });

  const [term] = await db
    .select({
      ...getTableColumns(termsTable),
      author: {
        name: usersTable.name,
      },
    })
    .from(termsTable)
    .where(eq(termsTable.id, Number(termId)))
    .innerJoin(usersTable, eq(termsTable.authorId, usersTable.id))
    .limit(1);

  return (
    <HydrateClient>
      <main className="p-8 space-y-4">
        <Link
          className="flex items-center gap-1"
          href={`/terms/alternates/${term.term}`}
        >
          <ArrowLeftIcon className="size-4" />
          Other definitions for {term.term}
        </Link>
        <section className="flex gap-4">
          <Suspense fallback={<TermVotesFallback />}>
            <TermVotes id={term.id} />
          </Suspense>
          <section className="flex-1">
            <h1 className="text-4xl font-semibold">{term.term}</h1>
            <div>
              <span className="italic">Definition: </span>
              {term.definition}
            </div>
            <div>
              <span className="italic">Examples: </span>
              {term.examples}
            </div>
            <div className="flex items-center gap-1">
              <span className="italic">Tags</span>
              {term.authorId === sesh.id && <EditTags termId={term.id} />}
            </div>
            <div className="flex items-center gap-0.5 flex-wrap">
              <Suspense fallback={<TermTagsFallback />}>
                <TermTags termId={term.id} />
              </Suspense>
            </div>
          </section>
          <TermMetadata term={term} author={term.author.name} />
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-medium">Comments</h2>
          <TermComments id={term.id} />
          <TermCommentBox id={term.id} />
        </section>
      </main>
    </HydrateClient>
  );
}
