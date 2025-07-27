"use client";

import { Definition } from "@/components/definition";
import { trpc } from "@/trpc/client";

export const DefinitionList = ({ termId }: { termId: number }) => {
  const [definitions] = trpc.definitions.list.useSuspenseQuery({ termId });

  return definitions.map((definition) => (
    <Definition key={definition.id} definition={definition} />
  ));
};
