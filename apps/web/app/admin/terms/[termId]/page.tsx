import { db, definitionsTable, termsTable } from "@yamz/db";
import { eq } from "drizzle-orm";
import { RunButton } from "./run";
import { HydrateClient, trpc } from "@/trpc/server";
import { Chats } from "./chats";
import { notFound, redirect } from "next/navigation";
import { GetAiUser } from "@/lib/crud";
import Link from "next/link";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import { LLMSystemPrompt } from "@/lib/apis/ollama";
import { auth } from "@/lib/auth"

export default async function JobPage(props: {
  params: Promise<{ termId: string }>;
}) {
  const { user } = await auth()
  if (!user?.isAdmin) redirect('/')

  const params = await props.params;
  const termId = Number(params.termId);

  const aiUser = await GetAiUser();

  const [term] = await Promise.all([
    db.query.termsTable.findFirst({
      where: eq(termsTable.id, termId),
      with: {
        definitions: {
          where: eq(definitionsTable.authorId, aiUser.id),
        },
      },
    }),
    trpc.admin.chats.prefetch(termId),
  ]);

  const aiDefinition = term?.definitions[0]

  if (!term) notFound();

  return (
    <HydrateClient>
      <main className="max-w-6xl w-full mx-auto p-4 space-y-4">
        <section className="flex justify-between items-center">
          <Link href="/admin" className="flex items-center text-blue-500 mb-2">
            <ArrowLeftIcon className="mr-2 size-4" /> All Terms
          </Link>
          {aiDefinition &&
            <Link href={`/definition/${aiDefinition.id}`} className="flex items-center text-blue-500 mb-2">
              <ExternalLinkIcon className="mr-2 size-4" /> Go To Term
            </Link>
          }
        </section>
        <section>
          <h1 className="text-4xl font-semibold">{term.term}</h1>
          <p>Definition: {term.definitions[0]?.definition}</p>
          <p>Example: {term.definitions[0]?.example}</p>
        </section>
        <section className="italic text-sm max-w-3/4 mx-auto text-center">System Prompt: {LLMSystemPrompt}</section>
        <Chats termId={termId} />
        <RunButton termId={termId} />
      </main>
    </HydrateClient>
  );
}
