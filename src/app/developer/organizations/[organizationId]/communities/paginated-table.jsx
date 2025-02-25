import { Button } from "@/components/ui/button";

export default function PaginatedTable({ table, columns }) {
  return (
    <div className="rounded-md border mt-4">
      <table className="w-full">
        <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="p-2 text-left">
                {header.isPlaceholder
                  ? null
                  : header.column.columnDef.header(header)}
              </th>
            ))}
          </tr>
        ))}
        </thead>
        <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="border-t">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="p-2">
                {cell.column.columnDef.cell
                  ? cell.column.columnDef.cell(cell)
                  : cell.getValue()}
              </td>
            ))}
          </tr>
        ))}
        </tbody>
      </table>
      <div className="flex items-center justify-end space-x-2 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}