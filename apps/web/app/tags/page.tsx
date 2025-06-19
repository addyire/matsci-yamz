import { TagModal } from "@/components/tags/create-modal";
import { db, tagsTable } from "@yamz/db";
import Link from "next/link";

export default async function TagsPage() {
  const tags = await db.select().from(tagsTable);

  return (
    <main className="max-w-2xl w-full mx-auto p-8">
      <section className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Tags</h1>
        <TagModal />
      </section>
      {tags.map((tag) => (
        <div key={tag.id}>
          <Link href={`/tags/${tag.id}`} className="text-blue-500">
            {tag.name}
          </Link>
        </div>
      ))}
    </main>
  );
}
