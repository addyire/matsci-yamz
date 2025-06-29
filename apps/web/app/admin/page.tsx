import { HydrateClient, trpc } from "@/trpc/server";
import { Job } from "@yamz/db";
import { ColumnDef } from "@tanstack/react-table";
import { JobsTable } from "./table";

export default async function AdminPage() {
  await trpc.jobs.get.prefetch();

  return (
    <HydrateClient>
      <main className="max-w-2xl w-full mx-auto my-4 space-y-2">
        <h1 className="text-4xl font-semibold">Jobs</h1>
        <JobsTable />
      </main>
    </HydrateClient>
  );
}
