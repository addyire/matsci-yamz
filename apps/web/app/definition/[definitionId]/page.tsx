import { EditDefinitionDialog } from "@/components/definition/edit-dialog";
import { EditTags } from "@/components/tags/selector";
import { TermTags, TermTagsFallback } from "@/components/tags/tags";
import { TermCommentBox } from "@/components/term/comment-box";
import { TermComments } from "@/components/term/comments";
import { TermVotes } from "@/components/term/votes";
import { getSession } from "@/lib/session";
import { HydrateClient, trpc } from "@/trpc/server";
import { lightFormat } from "date-fns";
import { ArrowLeftIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function TermPage(props: {
  params: Promise<{ definitionId: string }>;
}) {
  const sesh = await getSession();
  const { definitionId } = await props.params;

  trpc.comments.get.prefetch(Number(definitionId));
  trpc.tags.get.prefetch({ definitionId: Number(definitionId) });
  trpc.votes.get.prefetch({ definitionId: Number(definitionId) });

  const definition = await trpc.definitions.get({
    definitionId: Number(definitionId),
  });

  return (
    <HydrateClient>
      <main className="p-8 space-y-4 max-w-7xl w-full mx-auto">
        <Link
          className="flex items-center gap-1"
          href={`/terms/${definition.termId}`}
        >
          <ArrowLeftIcon className="size-4" />
          Other definitions for {definition.term}
        </Link>
        <section className="flex gap-4">
          <TermVotes
            initial={{ score: definition.score, vote: definition.vote }}
            definitionId={definition.id}
          />
          <section className="flex-1">
            <h1 className="text-4xl font-semibold">{definition.term}</h1>
            <div>
              <span className="italic">Definition: </span>
              {definition.definition}
            </div>
            <div>
              <span className="italic">Examples: </span>
              {definition.example}
            </div>
            <div className="flex items-center gap-1">
              <span className="italic">Tags</span>
              {definition.authorId === sesh.id && (
                <EditTags definitionId={definition.id} />
              )}
            </div>
            <div className="flex items-center gap-0.5 flex-wrap">
              <Suspense fallback={<TermTagsFallback />}>
                <TermTags definitionId={definition.id} />
              </Suspense>
            </div>
          </section>
          <section className="flex flex-col items-end">
            {definition.authorId === sesh.id && (
              <EditDefinitionDialog
                defaultValues={definition}
                definitionId={definition.id}
              />
            )}
            {definition.author.isAi ? (
              <div className="text-blue-500 flex items-center">
                <SparklesIcon className="size-4 mr-2" />
                AI Generated Definition
              </div>
            ) : (
              <div>
                <span className="italic">Author: </span>
                {definition.author.name}
              </div>
            )}
            <div>
              <span className="italic">Created: </span>
              {lightFormat(definition.createdAt, "yyyy/MM/dd")}
            </div>
            {definition.updatedAt && (
              <div>
                <span className="italic">Last Updated: </span>
                {lightFormat(definition.updatedAt, "yyyy/MM/dd")}
              </div>
            )}
          </section>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-medium">Comments</h2>
          <TermComments id={definition.id} />
          <TermCommentBox id={definition.id} />
        </section>
      </main>
    </HydrateClient>
  );
}
