"use client";

import { TermVotes } from "@/components/term/votes";
import { Card } from "@/components/ui/card";
import { trpc } from "@/trpc/client";
import { lightFormat } from "date-fns";
import Link from "next/link";

export const DefinitionList = ({ termId }: { termId: number }) => {
  const [definitions] = trpc.definitions.list.useSuspenseQuery({ termId });

  return definitions.map((definition) => (
    <Link
      href={`/definition/${definition.id}`}
      className="block"
      key={definition.id}
    >
      <Card className="flex-row p-4">
        <TermVotes
          initial={{ score: definition.score, vote: definition.vote }}
          definitionId={definition.id}
        />
        <section className="flex-1">
          <div>
            <span className="italic">Definition: </span>
            {definition.definition}
          </div>
          <div>
            <span className="italic">Example: </span>
            {definition.example}
          </div>
        </section>
        <section>
          <div>
            <span className="italic">Created: </span>
            {lightFormat(definition.createdAt, "yyyy-MM-dd")}
          </div>
          {definition.updatedAt && (
            <div>
              <span className="italic">Last Updated: </span>
              {lightFormat(definition.updatedAt, "yyyy-MM-dd")}
            </div>
          )}
        </section>
      </Card>
    </Link>
  ));
};
