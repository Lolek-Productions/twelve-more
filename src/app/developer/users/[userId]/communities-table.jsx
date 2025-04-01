"use client";

import PaginatedTable from "@/components/DataTable/PaginatedTable";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { changeRoleOnUserInCommunity } from "@/lib/actions/user";
import {useApiToast} from "@/lib/utils.js";

export function CommunitiesTable({ userId, data, onCommunityRemoved, onRoleUpdated }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const { showResponseToast, showErrorToast } = useApiToast();
  const [updating, setUpdating] = useState(false);

  const handleRoleChange = async (communityId, membershipId, newRole) => {
    if (updating) return;

    try {
      setUpdating(true);

      const result = await changeRoleOnUserInCommunity(userId, communityId, newRole);

      if (!result.success) {
        showErrorToast(result.message);
        return;
      }

      showResponseToast(result);
      window.location.reload();
    } catch (error) {
      console.error("Error updating role:", error);
      showErrorToast(error);
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Community Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const community = row.original;
        return (
          <div className="font-medium">{community.role}</div>
        );
      },
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        return <div className="font-mono text-xs truncate max-w-[120px]">{row.original.id}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const community = row.original;
        return (
          <div className="justify-end flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Role change options */}
                {community.role === "member" && (
                  <DropdownMenuItem
                    onClick={() => handleRoleChange(community.id, community.membershipId, "leader")}
                    disabled={updating}
                  >
                    Make Leader
                  </DropdownMenuItem>
                )}
                {community.role === "leader" && (
                  <DropdownMenuItem
                    onClick={() => handleRoleChange(community.id, community.membershipId, "member")}
                    disabled={updating}
                  >
                    Make Member
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onCommunityRemoved(community.membershipId)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Remove from Community
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data,
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
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search communities..."
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>

      <PaginatedTable table={table} columns={columns}/>
    </div>
  );
}