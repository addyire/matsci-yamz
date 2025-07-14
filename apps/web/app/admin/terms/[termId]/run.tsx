"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";

export const RunButton = ({ termId }: { termId: number }) => {
  const { mutate, isPending } = trpc.admin.run.useMutation();

  return (
    <Button
      className="w-full"
      disabled={isPending}
      onClick={() => mutate(termId)}
    >
      {isPending ? "Running... Please don't close this tab" : "Run"}
    </Button>
  );
};
