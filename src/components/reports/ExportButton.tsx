/**
 * Export Button Component
 */

import { useState } from "react";
import { FiDownload, FiChevronDown } from "react-icons/fi";
import Button from "../ui/Button";

interface ExportButtonProps {
  onExport: (format: "csv" | "excel" | "pdf") => Promise<void>;
  disabled?: boolean;
}

export default function ExportButton({
  onExport,
  disabled = false,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    if (exporting) return; // Prevent multiple simultaneous exports
    setExporting(format);
    setIsOpen(false);
    try {
      await onExport(format);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export report");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || !!exporting}
        leftIcon={exporting ? undefined : <FiDownload />}
      >
        {exporting ? `Exporting ${exporting.toUpperCase()}...` : "Export"}
        {!exporting && <FiChevronDown className="ml-1" />}
      </Button>

      {isOpen && !exporting && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
            <div className="py-1">
              <button
                onClick={() => handleExport("csv")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export as Excel
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export as PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

