'use client'

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { trpc } from "@/trpc/client"
import { SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export const SearchSection = () => {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const { data } = trpc.search.useQuery({ query, limit: 4 }, {
    placeholderData: (old) => old,
  })

  return <div className="max-w-xl w-full space-y-2">
    <div className="relative h-[36px] bg-card rounded-md">
      <SearchIcon className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2" />
      <Input
        className="absolute inset-0 pl-8"
        placeholder="Search to get started..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
    {data?.map(item =>
      <Card onClick={() => router.push(`/definition/${item.definitions.id}`)} className="!gap-0 !p-2 cursor-pointer" key={item.definitions.id}>
        <h3 className="text-lg font-semibold">{item.terms.term}</h3>
        <p>{item.definitions.definition}</p>
      </Card>
    )}
    {data?.length === 0 && <div className="text-sm text-center py-12">
      no results found
    </div>}
  </div>
}
