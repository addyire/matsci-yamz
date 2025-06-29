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

type Job = RouterOutput["jobs"]["get"][number];
const columns: ColumnDef<Job>[] = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
  },
  { accessorKey: "type", header: "Type" },
  { id: "term", cell: ({ row }) => row.original.term.term, header: "Term" },
];

export function JobsTable() {
  const { data } = trpc.jobs.get.useQuery(undefined, {
    initialData: [],
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="!py-0 bg-secondary">
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
