"use client";

import type { Definition } from "@yamz/db";
import { lightFormat } from "date-fns";

interface Props {
  definition: Definition;
}

export const TermDefinition = ({ definition }: Props) => {
  return (
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
  );
};

export const TermMetadata = ({ definition }: Props) => (
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
);
