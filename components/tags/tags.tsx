"use client";

import { trpc } from "@/trpc/client";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

interface Props {
  definitionId: number;
}

export const TermTagsFallback = () => {
  return <Skeleton className="w-6 h-4" />;
};

export const TermTags = ({ definitionId }: Props) => {
  const [tags] = trpc.tags.get.useSuspenseQuery({ definitionId });

  return tags.map((tag) => <Badge key={tag.id}>{tag.name}</Badge>);
};
