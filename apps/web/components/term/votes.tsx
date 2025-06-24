"use client";

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { startTransition, useActionState, useOptimistic } from "react";
import {
  VoteArgs,
  VoteOnDefinition,
  VoteState,
} from "@/lib/api/votes/mutations";

interface Props {
  definitionId: number;
  initial: {
    score: number;
    vote: "up" | "down" | null;
  };
}

const voteValue = (v: "up" | "down" | null) =>
  v === "up" ? 1 : v === "down" ? -1 : 0;

export const TermVotes = ({ definitionId, initial }: Props) => {
  const [, dispatch, isPending] = useActionState<VoteState, VoteArgs>(
    VoteOnDefinition,
    { error: null },
  );

  const [optimistic, setOptimistic] = useOptimistic(
    initial,
    (prev, vote: "up" | "down") => ({
      vote,
      score:
        prev.vote === vote
          ? prev.score - voteValue(vote)
          : prev.score - voteValue(prev.vote) + voteValue(vote),
    }),
  );

  const mutate = (vote: "up" | "down") => {
    startTransition(async () => {
      setOptimistic(vote);
      dispatch({ definitionId, vote });
    });
  };

  return (
    <Card className="flex flex-col items-center !p-1 !gap-1 h-min rounded-full">
      <Button
        className={cn(
          "rounded-t-full !px-2 !pb-1",
          optimistic.vote === "up" ? "text-blue-500" : "",
        )}
        disabled={isPending}
        onClick={(e) => {
          e.preventDefault();
          mutate("up");
        }}
        variant="ghost"
      >
        <ArrowUpIcon />
      </Button>
      <span className="font-bold">{optimistic.score}</span>
      <Button
        className={cn(
          "rounded-b-full !px-2 !pt-1",
          optimistic.vote === "down" ? "text-blue-500" : "",
        )}
        disabled={isPending}
        onClick={(e) => {
          e.preventDefault();
          mutate("down");
        }}
        variant="ghost"
      >
        <ArrowDownIcon />
      </Button>
    </Card>
  );
};
