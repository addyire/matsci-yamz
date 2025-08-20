"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";

export const RunButton = ({ termId }: { termId: number }) => {
  const router = useRouter()

  const { mutate, isPending } = trpc.admin.run.useMutation({
    onSuccess: () => router.refresh()
  });

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
