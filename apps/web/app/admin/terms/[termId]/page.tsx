import { db, definitionsTable, termsTable } from "@yamz/db";
import { eq } from "drizzle-orm";
import { RunButton } from "./run";
import { HydrateClient, trpc } from "@/trpc/server";
import { Chats } from "./chats";
import { notFound } from "next/navigation";
import { GetAiUser } from "@/lib/crud";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { LLMSystemPrompt } from "@/lib/apis/ollama";

export default async function JobPage(props: {
  params: Promise<{ termId: string }>;
}) {
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

  if (!term) notFound();

  return (
    <HydrateClient>
      <main className="max-w-6xl w-full mx-auto p-4">
        <Link href="/admin" className="flex items-center text-blue-500 mb-2">
          <ArrowLeftIcon className="mr-2 size-4" /> All Terms
        </Link>
        <section>
          <h1 className="text-4xl font-semibold">{term.term}</h1>
          <p>Definition: {term.definitions[0]?.definition}</p>
          <p>Example: {term.definitions[0]?.example}</p>
        </section>
        <section className="italic">System: {LLMSystemPrompt}</section>
        <Chats termId={termId} />
        <RunButton termId={termId} />
      </main>
    </HydrateClient>
  );
}
