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
import { useApiToast } from "@/lib/utils";
import { runCommand } from "@/lib/actions/command";

function CommandsPage() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const { showResponseToast, showErrorToast } = useApiToast();

  const commands = [
    { id: "1", name: "Log Hello" },
    { id: "2", name: "Create Josh in Clerk" },
    { id: "3", name: "Delete Josh in Clerk" },
    { id: "4", name: "Send Test SMS" },
    { id: "5", name: "Send Test Batch SMS" },
    { id: "6", name: "TEST" },
    { id: "7", name: "Create System Post in Test Organization" },
  ];

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
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const command = row.original;

        const handleRunCommand = async () => {
          try {
            const response = await runCommand(command.name);
            showResponseToast(response);
          } catch (error) {
            showErrorToast(error);
          }
        };

        return (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleRunCommand}>
              Run
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: commands,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex: 0, // Explicitly set initial page
        pageSize: 10,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    // debugTable: true, // Keep for debugging
  });

  // Debug logging
  // console.log("Data:", commands);
  // console.log("Columns:", columns.length, columns);
  // console.log("State:", table.getState());
  // console.log("Core Row Model:", table.getCoreRowModel());
  // console.log("Rows:", table.getRowModel().rows);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter commands by name..."
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <PaginatedTable table={table} columns={columns} />
    </div>
  );
}

export default CommandsPage;