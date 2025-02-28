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
import {useParams, useRouter} from "next/navigation";

export function CommunityTable({ data, deleteEntity, onManageMembers }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  const params = useParams();
  const organizationId = params?.organizationId;

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
    },
    // {
    //   accessorKey: "members",
    //   header: ({ column }) => (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       Members
    //       <ArrowUpDown className="ml-2 h-4 w-4" />
    //     </Button>
    //   ),
    //   cell: ({ row }) => {
    //     const members = row.getValue("members") || [];
    //     return <div>{members.length}</div>;
    //   },
    // },

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

  const handleRowClick = (community) => {
    // console.log('communityID', community.id);
    router.push(`/developer/organizations/${organizationId}/communities/${community.id}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter communities by name..."
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <PaginatedTable table={table} columns={columns} onRowClick={handleRowClick} />
    </div>
  );
}