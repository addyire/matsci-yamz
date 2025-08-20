import { SearchSection } from "./search-section";
import { HydrateClient, trpc } from "@/trpc/server";

export default async function Home() {
  await trpc.search.prefetch({ query: '', limit: 4 })

  return (
    <HydrateClient>
      <main className="flex flex-col items-center justify-center p-8 gap-6">
        <section className="flex flex-col text-center gap-1 py-12">
          <h1 className="text-4xl font-semibold">Welcome to the MatSci YAMZ</h1>
          <p>A dictionary for all material science metadata.</p>
        </section>
        <SearchSection />
      </main>
    </HydrateClient>
  );
}
