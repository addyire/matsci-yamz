import type { Definition as DefinitionType } from "@yamz/db";
import Link from "next/link";
import { Card } from "./ui/card";
import { TermVotes } from "./term/votes";
import { lightFormat } from "date-fns";
import { ReactNode } from "react";

export const Definition = ({
  definition,
  children,
}: {
  definition: DefinitionType & { vote?: "up" | "down" | null };
  children?: ReactNode;
}) => (
  <Link
    href={`/definition/${definition.id}`}
    className="block"
    key={definition.id}
  >
    <Card className="flex-row p-4">
      {definition.vote !== undefined && (
        <TermVotes
          initial={{ score: definition.score, vote: definition.vote }}
          definitionId={definition.id}
        />
      )}
      <section className="flex-1">
        {children}
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
);
