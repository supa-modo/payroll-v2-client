/**
 * Report Table Component
 */

import DataTable from "../ui/DataTable";

interface ReportTableProps<T = any> {
  data: T[];
  columns: Array<{
    header: string;
    accessor: keyof T | ((row: T) => any);
    format?: (value: any) => string;
  }>;
  onExport?: (format: "csv" | "excel" | "pdf") => void;
  showSummary?: boolean;
  summaryRow?: T;
}

export default function ReportTable<T extends Record<string, any> = any>({
  data,
  columns,
  onExport,
  showSummary = false,
  summaryRow,
}: ReportTableProps<T>) {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  const tableColumns = columns.map((col) => ({
    header: col.header,
    cell: (row: T) => {
      const value =
        typeof col.accessor === "function"
          ? col.accessor(row)
          : row[col.accessor];
      return col.format ? col.format(value) : String(value ?? "");
    },
  }));

  return (
    <div className="bg-white rounded-lg shadow">
      {onExport && (
        <div className="p-4 border-b flex justify-end gap-2">
          <button
            onClick={() => onExport("csv")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Export CSV
          </button>
          <button
            onClick={() => onExport("excel")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Export Excel
          </button>
          <button
            onClick={() => onExport("pdf")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Export PDF
          </button>
        </div>
      )}
      <DataTable columns={tableColumns} rows={safeData} />
      {showSummary && summaryRow && (
        <div className="p-4 bg-gray-50 border-t">
          <div className="grid grid-cols-4 gap-4 font-semibold">
            {columns.map((col, index) => (
              <div key={index}>
                {typeof col.accessor === "function"
                  ? col.format
                    ? col.format(col.accessor(summaryRow))
                    : String(col.accessor(summaryRow) ?? "")
                  : col.format
                  ? col.format(summaryRow[col.accessor])
                  : String(summaryRow[col.accessor] ?? "")}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

