import type { Definition as DefinitionType, Term as TermType } from "@yamz/db"
import Link from "next/link"
import { Card } from "./ui/card"
import { TermVotes } from "./term/votes"
import { lightFormat } from "date-fns"
import { ReactNode } from "react"
import { ArrowRight } from "lucide-react"

export const Term = ({
  term
}: {
  term: TermType & { count?: number | null }
}) => (
  <Link href={`/terms/${term.id}`} className="block">
    <Card className="flex-row justify-between p-4">
      <h1 className="text-lg font-bold">{term.term}</h1>
      {term.count && (
        <p className="text-blue-500 flex items-center">
          {term.count} definitions <ArrowRight className="size-4 ml-2" />
        </p>
      )}
    </Card>
  </Link>
)

export const Definition = ({
  definition,
  children
}: {
  definition: DefinitionType & { vote?: "up" | "down" | null }
  children?: ReactNode
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
)
