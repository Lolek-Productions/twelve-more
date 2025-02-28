"use client";

import PaginatedTable from "@/components/DataTable/PaginatedTable";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { runCommand } from "@/lib/actions/command"; // Import action

export function CommandsTable({ data }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const { toast } = useToast();

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
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const command = row.original;

        const handleRunCommand = async () => {
          try {
            const response = await runCommand(command.name);
            if (response.success) {
              toast({
                title: "Success",
                description: response.message,
              });
            } else {
              toast({
                variant: "destructive",
                title: "Error",
                description: response.error,
              });
            }
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to run command",
            });
          }
        };

        return (
          <div className="justify-end flex">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunCommand}
            >
              Run
            </Button>
          </div>
        );
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter commands by name..."
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <PaginatedTable table={table} columns={columns} />
    </div>
  );
}