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

  // Debugging for API parameters
  useEffect(() => {
    console.log('API Parameters:', {
      page,
      limit,
      filtering,
      sortField,
      sortOrder
    });
  }, [page, limit, filtering, sortField, sortOrder]);

  // Load parishes data
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

  // Column helper for type-safe column definitions
  const columnHelper = createColumnHelper();

  // Columns definition
  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <button
          className="flex items-center"
          onClick={() => {
            const isAsc = sortField === 'name' && sortOrder === 'asc';
            setSortField('name');
            setSortOrder(isAsc ? 'desc' : 'asc');
          }}
        >
          Parish Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
          {sortField === 'name' && (
            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
      ),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('city', {
      header: ({ column }) => (
        <button
          className="flex items-center"
          onClick={() => {
            const isAsc = sortField === 'city' && sortOrder === 'asc';
            setSortField('city');
            setSortOrder(isAsc ? 'desc' : 'asc');
          }}
        >
          City
          <ArrowUpDown className="ml-2 h-4 w-4" />
          {sortField === 'city' && (
            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
      ),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('state', {
      header: ({ column }) => (
        <button
          className="flex items-center"
          onClick={() => {
            const isAsc = sortField === 'state' && sortOrder === 'asc';
            setSortField('state');
            setSortOrder(isAsc ? 'desc' : 'asc');
          }}
        >
          State
          <ArrowUpDown className="ml-2 h-4 w-4" />
          {sortField === 'state' && (
            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
      ),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('zipcode', {
      header: ({ column }) => (
        <button
          className="flex items-center"
          onClick={() => {
            const isAsc = sortField === 'zipcode' && sortOrder === 'asc';
            setSortField('zipcode');
            setSortOrder(isAsc ? 'desc' : 'asc');
          }}
        >
          Zipcode
          <ArrowUpDown className="ml-2 h-4 w-4" />
          {sortField === 'zipcode' && (
            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
      ),
      cell: info => info.getValue() || 'No Zipcode',
    }),
    columnHelper.accessor('address', {
      header: ({ column }) => (
        <button
          className="flex items-center"
          onClick={() => {
            const isAsc = sortField === 'address' && sortOrder === 'asc';
            setSortField('address');
            setSortOrder(isAsc ? 'desc' : 'asc');
          }}
        >
          Address
          <ArrowUpDown className="ml-2 h-4 w-4" />
          {sortField === 'address' && (
            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
      ),
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
    },
    // We're handling sorting directly, not through the table's internal state
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
              parishes.map((parish, index) => (
                <tr key={parish.id || index} className="border-b hover:bg-gray-50">
                  <td className="p-2">{parish.name}</td>
                  <td className="p-2">{parish.city}</td>
                  <td className="p-2">{parish.state}</td>
                  <td className="p-2">{parish.zipcode || 'No Zipcode'}</td>
                  <td className="p-2">{parish.address || 'No address'}</td>
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