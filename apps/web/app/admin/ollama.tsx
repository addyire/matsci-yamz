'use client'

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { trpc } from "@/trpc/client"


export const TestOllama = () => {
  const { data } = trpc.admin.ollama.useQuery()

  return <Card>
    <section className="flex items-center justify-between px-6">
      <CardTitle>
        Model
      </CardTitle>
      <div className="flex items-center gap-2">
        {data
          ? <><div className="size-3 rounded-full bg-green-500" /> Ready</>
          : <><div className="size-3 rounded-full bg-red-500" /> Error</>}
      </div>
    </section>
    <Separator />
    <CardContent>
      <p>Family: {data?.details.family}</p>
      <p>Parameters: {data?.details.parameter_size}</p>
    </CardContent>
  </Card>
}
