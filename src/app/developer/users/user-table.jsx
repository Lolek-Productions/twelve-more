"use client";

import PaginatedTable from "@/components/DataTable/PaginatedTable";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export function UserTable({ data, deleteEntity }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const router = useRouter(); // Initialize useRouter

  const columns = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div>
            {row.getValue("name")}
          </div>
        )
      },
    },
    {
      accessorKey: "id",
      cell: ({ row }) => {
        return (
          <div>
            {row.getValue("id")}
          </div>
        )
      },
    },
    {
      accessorKey: "clerkId",
      cell: ({ row }) => {
        return (
          <div>
            {row.getValue("clerkId")}
          </div>
        )
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting, columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleRowClick = (user) => {
    router.push(`/developer/users/${user.id}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter users by name..."
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <PaginatedTable table={table} columns={columns} onRowClick={handleRowClick} />
    </div>
  );
}