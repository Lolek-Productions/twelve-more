"use client"

import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import {getParishes} from "@/lib/actions/parish.js";

function ParishesPage() {
  const [parishes, setParishes] = useState([]);
  const [totalParishes, setTotalParishes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filtering, setFiltering] = useState('');

  useEffect(() => {
    const loadParishes = async () => {
      setLoading(true);
      try {
        const { parishes, totalCount } = await getParishes({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          sorting,
          filtering
        });

        setParishes(parishes);
        setTotalParishes(totalCount);
      } catch (error) {
        console.error('Failed to load parishes', error);
      } finally {
        setLoading(false);
      }
    };

    loadParishes();
  }, [pagination, sorting, filtering]);

  // Column helper for type-safe column definitions
  const columnHelper = createColumnHelper();

  // Columns definition
  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <button
          className="flex items-center"
          onClick={() => column.toggleSorting()}
        >
          Parish Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('city', {
      header: ({ column }) => (
        <button
          className="flex items-center"
          onClick={() => column.toggleSorting()}
        >
          City
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('state', {
      header: 'State',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('zipcode', {
      header: 'Zipcode',
      cell: info => info.getValue() || 'No Zipcode',
    }),
    columnHelper.accessor('address', {
      header: 'Address',
      cell: info => info.getValue() || 'No address',
    }),
  ];

  // Create table instance
  const table = useReactTable({
    data: parishes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(totalParishes / pagination.pageSize),
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Parishes/Organizations Directory - Total Count: {totalParishes}</h1>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search parishes..."
          value={filtering}
          onChange={(e) => {
            setFiltering(e.target.value);
            table.setPageIndex(0);
          }}
          className="border rounded px-2 py-1 w-full"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <p>Loading parishes...</p>
        </div>
      )}

      {/* Parishes Table */}
      {!loading && (
        <>
          <table className="w-full border-collapse">
            <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-100">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="border p-2 text-left"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
            </thead>
            <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-2">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex items-center border rounded px-2 py-1 disabled:opacity-50"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex items-center border rounded px-2 py-1 disabled:opacity-50"
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>

            <div className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{' '} {Math.ceil(totalParishes / table.getState().pagination.pageSize)}
            </div>

            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="border rounded px-2 py-1"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}

export default ParishesPage;