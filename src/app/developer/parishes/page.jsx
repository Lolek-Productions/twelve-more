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
import { getParishes } from "@/lib/actions/parish.js";

function ParishesPage() {
  const [parishes, setParishes] = useState([]);
  const [totalParishes, setTotalParishes] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // Start at page 1 (not 0)
  const [limit, setLimit] = useState(10);
  const [filtering, setFiltering] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const loadParishes = async () => {
      setLoading(true);
      try {
        // Match the expected parameter structure of getParishes function
        const result = await getParishes({
          page,
          limit,
          filtering,
          sortField,
          sortOrder
        });

        if (result.success) {
          setParishes(result.parishes);
          setTotalParishes(result.totalCount);
          setTotalPages(result.totalPages);
        } else {
          console.error('Failed to load parishes', result);
        }
      } catch (error) {
        console.error('Failed to load parishes', error);
      } finally {
        setLoading(false);
      }
    };

    loadParishes();
  }, [page, limit, filtering, sortField, sortOrder]);

  // Handle sorting changes from the table
  const handleSortingChange = (newSorting) => {
    if (newSorting.length > 0) {
      const column = newSorting[0].id;
      const direction = newSorting[0].desc ? 'desc' : 'asc';
      setSortField(column);
      setSortOrder(direction);
    } else {
      setSortField('name');
      setSortOrder('asc');
    }
  };

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
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex: page - 1, // Convert from 1-based to 0-based for table
        pageSize: limit,
      },
      sorting: sortField ? [{ id: sortField, desc: sortOrder === 'desc' }] : [],
      globalFilter: filtering,
    },
    onSortingChange: handleSortingChange,
    // We'll handle pagination manually
  });

  // Handle manual pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

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
            setPage(1); // Reset to first page on new search
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
            {parishes.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center">
                  No parishes found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
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
              ))
            )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className="flex items-center border rounded px-2 py-1 disabled:opacity-50"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className="flex items-center border rounded px-2 py-1 disabled:opacity-50"
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>

            <div className="text-sm">
              Page {page} of {Math.max(1, totalPages)}
            </div>

            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setLimit(newLimit);
                setPage(1); // Reset to first page when changing page size
              }}
              className="border rounded px-2 py-1"
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size}
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