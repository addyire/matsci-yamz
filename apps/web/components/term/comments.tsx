"use client";

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Button } from "../ui/button";
import { trpc } from "@/trpc/client";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";

interface Props {
  id: number;
}

export const TermVotesFallback = () => {
  return (
    <div className="flex flex-col items-center">
      <Button variant="ghost" disabled>
        <ArrowUpIcon />
      </Button>
      <Skeleton className="w-6 h-4" />
      <Button variant="ghost" disabled>
        <ArrowDownIcon />
      </Button>
    </div>
  );
};

export const TermComments = ({ id }: Props) => {
  const [comments] = trpc.comments.get.useSuspenseQuery(id);

  return (
    <div className="flex flex-col gap-2">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent>
            <span className="italic">{comment.author.name}</span>
            <p>{comment.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
