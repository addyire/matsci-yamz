'use client'

import { trpc } from "@/trpc/client"
import { DropdownMenuItem } from "./ui/dropdown-menu"
import { useRouter } from "next/navigation"

export const LogoutButton = () => {
  const router = useRouter()
  const { mutate: logout } = trpc.logout.useMutation({ onSuccess: () => router.refresh() })

  return <DropdownMenuItem onClick={() => logout()} className="text-red-500">
    Logout
  </DropdownMenuItem>
}
