"use client"

import { Button } from "@/components/ui/button"
import { trpc } from "@/trpc/client"
import { useRouter } from "next/navigation"

export const DeleteDefinitionButton = ({ id }: { id: number }) => {
  const router = useRouter()
  const { mutate } = trpc.definitions.delete.useMutation({
    onSuccess: () => router.replace(`/`)
  })

  return (
    <Button onClick={() => mutate(id)} variant="destructive">
      Delete Definition
    </Button>
  )
}
