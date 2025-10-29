"use client"

import { Definition, Term } from "@/components/definition"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/trpc/client"
import { SearchIcon } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

export default function SuspenseSearchPage() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  )
}

const SearchPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [mode, setMode] = useState<"definitions" | "terms">(
    (searchParams.get("mode") as "definitions" | "terms") || "terms"
  )

  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (mode !== "terms") params.set("mode", mode)

    const newUrl = params.toString()
      ? `/search?${params.toString()}`
      : "/search"
    router.replace(newUrl, { scroll: false })
  }, [query, mode, router])

  return (
    <main className="max-w-4xl w-full mx-auto p-4 space-y-4">
      <section className="flex items-center gap-2">
        <section className="relative h-[36px] flex-1">
          <SearchIcon className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
          <Input
            className="absolute inset-0 pl-8"
            value={query}
            placeholder="Search..."
            onChange={(e) => setQuery(e.target.value)}
          />
        </section>
        <Tabs
          defaultValue="terms"
          value={mode}
          onValueChange={(m) => setMode(m as typeof mode)}
        >
          <TabsList>
            <TabsTrigger value="terms">Terms</TabsTrigger>
            <TabsTrigger value="definitions">Definitions</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>
      {mode === "definitions" && <DefinitionsSearch query={query} />}
      {mode === "terms" && <TermsSearch query={query} />}
    </main>
  )
}

interface SearchProps {
  query: string
}

const DefinitionsSearch = ({ query }: SearchProps) => {
  const { data } = trpc.search.definitions.useQuery(
    { query, limit: 10 },
    {
      placeholderData: (old) => old
    }
  )

  return (
    <section className="flex flex-col gap-2">
      {data?.map((result) => (
        <Definition definition={result} key={result.id}>
          <h1 className="text-2xl font-semibold">{result.term}</h1>
        </Definition>
      ))}
    </section>
  )
}

const TermsSearch = ({ query }: SearchProps) => {
  const { data } = trpc.search.terms.useQuery(
    { query, limit: 10 },
    {
      placeholderData: (old) => old
    }
  )

  return (
    <section className="flex flex-col gap-2">
      {/* @ts-expect-error counting terms */}
      {data?.map((result) => <Term term={result} key={result.id} />)}
    </section>
  )
}
