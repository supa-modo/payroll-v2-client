import React from "react";
import Checkbox from "./Checkbox";

interface Column<T = any> {
  header: string | React.ReactNode;
  cell: (row: T, rowIndex: number) => React.ReactNode;
  id?: string;
  headerClassName?: string;
  cellClassName?: string;
  accessor?: keyof T;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  rows: T[];
  totalItems?: number;
  startIndex?: number;
  endIndex?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  isAllSelected?: boolean;
  onToggleAll?: (checked: boolean) => void;
  isRowSelected?: (row: T) => boolean;
  onToggleRow?: (rowId: string | number, checked: boolean) => void;
  getRowId?: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  tableLoading?: boolean;
  hasSearched?: boolean;
  showCheckboxes?: boolean;
  autonumber?: boolean;
}

const DataTable = <T extends Record<string, any> = any>({
  columns = [],
  rows = [],
  totalItems = 0,
  startIndex = 0,
  endIndex = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 30,
  onPageSizeChange,
  pageSizeOptions = [20, 30, 50, 100],
  isAllSelected = false,
  onToggleAll,
  isRowSelected = () => false,
  onToggleRow,
  getRowId = (row) => (row as any).id,
  onRowClick,
  tableLoading = false,
  hasSearched = false,
  showCheckboxes = true,
  autonumber = true,
}: DataTableProps<T>) => {
  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) onPageChange(currentPage + 1);
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pageNumbers: (number | string)[] = [];
    const maxVisible = 5;

    if (currentPage <= 3) {
      for (let i = 1; i <= maxVisible; i++) {
        pageNumbers.push(i);
      }
      if (totalPages > maxVisible) {
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1);
      if (totalPages > maxVisible) {
        pageNumbers.push("...");
      }
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      pageNumbers.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  const LoadingSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, idx) => (
        <tr key={`skeleton-${idx}`} className="animate-pulse">
          {autonumber && (
            <td className="pl-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </td>
          )}
          {showCheckboxes && (
            <td className="pl-6 py-4">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
            </td>
          )}
          {columns.map((_col, colIdx) => (
            <td key={`skeleton-${idx}-${colIdx}`} className="px-4 py-4">
              <div className="h-4 bg-gray-200 rounded"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  const NoRecordsFound = () => (
    <tr>
      <td
        colSpan={
          (autonumber ? 1 : 0) + (showCheckboxes ? 1 : 0) + columns.length
        }
        className="px-6 py-12 text-center"
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-600">
              {hasSearched ? "No results found!" : "No records available!"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {hasSearched
                ? "Try adjusting your search terms or filter criteria"
                : "No data is currently available in the system"}
            </p>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="px-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 bg-gray-100">
            <tr>
              {showCheckboxes && (
                <th scope="col" className="pl-6 py-3">
                  <Checkbox
                    checked={isAllSelected}
                    onChange={(checked) => onToggleAll && onToggleAll(checked)}
                  />
                </th>
              )}
              {autonumber && (
                <th scope="col" className="pl-6 py-3">
                  #
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={`header-${col.id || idx}`}
                  scope="col"
                  className={`px-6 py-3 ${col.headerClassName || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableLoading ? (
              <LoadingSkeleton />
            ) : rows.length === 0 ? (
              <NoRecordsFound />
            ) : (
              rows.map((row, rowIdx) => {
                const rowId = getRowId(row);
                const selected = isRowSelected(row);
                const rowNumber = startIndex > 0 ? startIndex + rowIdx : rowIdx + 1;

                return (
                  <tr
                    key={`row-${rowId ?? rowIdx}`}
                    className={`bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      selected ? "bg-green-50" : ""
                    } ${onRowClick ? "cursor-pointer" : ""}`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {showCheckboxes && (
                      <td className="pl-6 py-4">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selected}
                            onChange={(checked) =>
                              onToggleRow && onToggleRow(rowId, checked)
                            }
                          />
                        </div>
                      </td>
                    )}
                    {autonumber && (
                      <td className="pl-6 py-4">
                        <span className="text-sm text-gray-600 font-medium">
                          {rowNumber}.
                        </span>
                      </td>
                    )}
                    {columns.map((col, colIdx) => (
                      <td
                        key={`cell-${colIdx}-${rowId}`}
                        className={`px-6 py-4 ${col.cellClassName || ""}`}
                      >
                        {col.cell
                          ? col.cell(row, rowIdx)
                          : col.accessor
                            ? row[col.accessor]
                            : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 px-6 pb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {totalItems > 0
              ? `Showing ${startIndex} to ${endIndex} of ${totalItems}`
              : "Showing 0 to 0 of 0"}
          </span>
          {onPageSizeChange && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Show:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  const newSize = parseInt(e.target.value, 10);
                  onPageSizeChange(newSize);
                  if (onPageChange) {
                    onPageChange(1);
                  }
                }}
                className="px-2 py-1 text-sm border border-gray-300 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {rows.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {pageNumbers.map((pageNum, idx) => {
                if (pageNum === "...") {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-600">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() =>
                      onPageChange && onPageChange(pageNum as number)
                    }
                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? "bg-green-600 text-white"
                        : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;

