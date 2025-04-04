"use client";

import PaginatedTable from "@/components/DataTable/PaginatedTable";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useParams, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CommunityTable({
                                 data,
                                 deleteEntity,
                                 onManageMembers,
                                 handleSetWelcomingCommittee,
                                 handleSetLeadershipCommunity,
                                 organization
                               }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  const params = useParams();
  const organizationId = params?.organizationId;

  const router = useRouter();

  // Check if the organization and data are properly loaded
  useEffect(() => {
    console.log("Organization data:", organization);
    console.log("Communities data:", data);

    if (organization && organization.welcomingCommunity) {
      console.log("Welcoming Community ID:", organization.welcomingCommunity);
    }

    if (organization && organization.leadershipCommunity) {
      console.log("Leadership Community ID:", organization.leadershipCommunity);
    }
  }, [organization, data]);

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
        const community = row.original;

        // Check if this community is special
        const isWelcoming = organization?.welcomingCommunity === community.id ||
          organization?.welcomingCommunity?._id === community.id ||
          String(organization?.welcomingCommunity) === community.id;

        const isLeadership = organization?.leadershipCommunity === community.id ||
          organization?.leadershipCommunity?._id === community.id ||
          String(organization?.leadershipCommunity) === community.id;

        return (
          <div className="flex items-center gap-2">
            <span>{community.name}</span>
            {isWelcoming && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                Welcoming
              </span>
            )}
            {isLeadership && (
              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full font-medium">
                Leadership
              </span>
            )}
          </div>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const community = row.original;

        // Check if this community is special (use the same logic as above)
        const isWelcoming = organization?.welcomingCommunity === community.id ||
          organization?.welcomingCommunity?._id === community.id ||
          String(organization?.welcomingCommunity) === community.id;

        const isLeadership = organization?.leadershipCommunity === community.id ||
          organization?.leadershipCommunity?._id === community.id ||
          String(organization?.leadershipCommunity) === community.id;

        return (
          <div className="flex items-center justify-end space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetWelcomingCommittee(community.id);
                  }}
                >
                  {isWelcoming ? '✓ Welcoming Community' : 'Set as Welcoming Community'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetLeadershipCommunity(community.id);
                  }}
                >
                  {isLeadership ? '✓ Leadership Community' : 'Set as Leadership Community'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      header: "Actions",
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

  const handleRowClick = (community) => {
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