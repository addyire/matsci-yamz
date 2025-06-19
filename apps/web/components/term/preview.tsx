"use client";

import type { Term } from "@yamz/db";
import { lightFormat } from "date-fns";
import Link from "next/link";

interface Props {
  term: Term;
}

export const TermDefinition = ({ term }: Props) => {
  return (
    <section className="flex-1">
      <div>
        <span className="italic">Term: </span>
        <Link
          href={`/terms/${term.id}`}
          className="text-blue-500 font-semibold"
        >
          {term.term}
        </Link>
      </div>
      <div>
        <span className="italic">Definition: </span>
        {term.definition}
      </div>
      <div>
        <span className="italic">Examples: </span>
        {term.examples}
      </div>
    </section>
  );
};

interface MetaDataProps extends Props {
  author: string;
}

export const TermMetadata = ({ term }: MetaDataProps) => (
  <section>
    <div>
      <span className="italic">Created: </span>
      {lightFormat(term.createdAt, "yyyy-MM-dd")}
    </div>
    <div>
      <span className="italic">Last Updated: </span>
      {lightFormat(term.modifiedAt, "yyyy-MM-dd")}
    </div>
    {/* <div> */}
    {/*   <span className="italic">Author: </span> */}
    {/*   {author} */}
    {/* </div> */}
  </section>
);
