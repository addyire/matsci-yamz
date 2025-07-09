"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { trpc } from "@/trpc/client";
import type { RouterOutput } from "@/trpc/trpc-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";

type Job = RouterOutput["admin"]["jobs"]["get"][number];
const columns: ColumnDef<Job>[] = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
  },
  { accessorKey: "type", header: "Type" },
  { id: "term", cell: ({ row }) => row.original.term.term, header: "Term" },
  {
    id: "run",
    cell: ({ row, table }) => (
      <Button
        disabled={table.options.meta!.loading || false}
        onClick={() => table.options.meta?.run(row.original.id)}
      >
        <PlayIcon className="size-4" />
      </Button>
    ),
  },
];

export function JobsTable() {
  const { data } = trpc.admin.jobs.get.useQuery(undefined, {
    initialData: [],
  });

  const { mutate, isPending } = trpc.admin.jobs.run.useMutation();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      run: mutate,
      loading: isPending,
    },
  });

  return (
    <Card className="!py-0">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
