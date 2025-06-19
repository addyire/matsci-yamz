"use client";

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Button } from "../ui/button";
import { trpc } from "@/trpc/client";
import { Skeleton } from "../ui/skeleton";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

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

export const TermVotes = ({ id }: Props) => {
  const utils = trpc.useUtils();
  const [data] = trpc.votes.get.useSuspenseQuery(id);

  const mutation = trpc.votes.vote.useMutation({
    onMutate: async (input) => {
      await utils.votes.get.cancel();

      utils.votes.get.setData(id, (old) =>
        !old
          ? old
          : {
              ...old,
              userVote: input.vote,
            },
      );
    },
    onSettled: () => utils.votes.get.invalidate(),
  });

  return (
    <Card className="flex flex-col items-center !p-1 !gap-1 h-min rounded-full">
      <Button
        className={cn(
          "rounded-t-full !px-2 !pb-1",
          data.userVote === "up" ? "text-blue-500" : "",
        )}
        onClick={() => mutation.mutate({ id, vote: "up" })}
        variant="ghost"
      >
        <ArrowUpIcon />
      </Button>
      <span className="font-bold">{data.score ?? 0}</span>
      <Button
        className={cn(
          "rounded-b-full !px-2 !pt-1",
          data.userVote === "down" ? "text-blue-500" : "",
        )}
        onClick={() => mutation.mutate({ id, vote: "down" })}
        variant="ghost"
      >
        <ArrowDownIcon />
      </Button>
    </Card>
  );
};
