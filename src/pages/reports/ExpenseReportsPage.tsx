/**
 * Expense Reports Page
 */

import { useState, useEffect } from "react";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportChart from "../../components/reports/ReportChart";
import ReportTable from "../../components/reports/ReportTable";
import ExportButton from "../../components/reports/ExportButton";
import { getExpenseReports, exportReport } from "../../api/reports";
import {
  ExpenseReportType,
  ReportFilters as ReportFiltersType,
} from "../../types/report";
import { formatCurrency, formatPercentage } from "../../utils/format";

const REPORT_TYPES: Array<{ value: ExpenseReportType; label: string }> = [
  { value: "category", label: "By Category" },
  { value: "department", label: "By Department" },
  { value: "trends", label: "Monthly Trends" },
  { value: "top-spenders", label: "Top Spenders" },
];

export default function ExpenseReportsPage() {
  const [reportType, setReportType] = useState<ExpenseReportType>("category");
  const [filters, setFilters] = useState<ReportFiltersType>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportType, filters]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await getExpenseReports(reportType, filters);
      setReportData(response.report);
    } catch (error) {
      console.error("Failed to load report:", error);
      alert("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    try {
      const blob = await exportReport(`expense:${reportType}`, format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expense-${reportType}-${filters.startDate}-to-${filters.endDate}.${format === "excel" ? "xlsx" : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export report");
    }
  };

  const renderReport = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading report...</p>
        </div>
      );
    }

    // Ensure reportData is always an array for table/chart components
    const safeReportData = Array.isArray(reportData) ? reportData : [];

    if (!reportData || safeReportData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available for the selected period</p>
        </div>
      );
    }

    switch (reportType) {
      case "category":
        return (
          <>
            <ReportChart
              data={safeReportData}
              type="pie"
              dataKey="categoryName"
              valueKey="totalAmount"
              height={300}
            />
            <ReportTable
              data={safeReportData}
              columns={[
                { header: "Category", accessor: "categoryName" },
                { header: "Count", accessor: "expenseCount" },
                {
                  header: "Total Amount",
                  accessor: "totalAmount",
                  format: formatCurrency,
                },
                {
                  header: "Average",
                  accessor: "averageAmount",
                  format: formatCurrency,
                },
                {
                  header: "Percentage",
                  accessor: "percentage",
                  format: formatPercentage,
                },
              ]}
              onExport={handleExport}
            />
          </>
        );

      case "department":
        return (
          <>
            <ReportChart
              data={safeReportData}
              type="bar"
              dataKey="departmentName"
              valueKey="totalAmount"
              height={300}
            />
            <ReportTable
              data={safeReportData}
              columns={[
                { header: "Department", accessor: "departmentName" },
                { header: "Count", accessor: "expenseCount" },
                {
                  header: "Total Amount",
                  accessor: "totalAmount",
                  format: formatCurrency,
                },
                {
                  header: "Average",
                  accessor: "averageAmount",
                  format: formatCurrency,
                },
                {
                  header: "Percentage",
                  accessor: "percentage",
                  format: formatPercentage,
                },
              ]}
              onExport={handleExport}
            />
          </>
        );

      case "trends":
        return (
          <>
            <ReportChart
              data={safeReportData}
              type="line"
              dataKey="month"
              valueKey="totalAmount"
              height={300}
            />
            <ReportTable
              data={safeReportData}
              columns={[
                { header: "Month", accessor: "month" },
                {
                  header: "Total Amount",
                  accessor: "totalAmount",
                  format: formatCurrency,
                },
                { header: "Count", accessor: "expenseCount" },
                {
                  header: "Average",
                  accessor: "averageAmount",
                  format: formatCurrency,
                },
              ]}
              onExport={handleExport}
            />
          </>
        );

      case "top-spenders":
        return (
          <>
            <ReportChart
              data={safeReportData}
              type="bar"
              dataKey="employeeName"
              valueKey="totalAmount"
              height={300}
            />
            <ReportTable
              data={safeReportData}
              columns={[
                { header: "Employee", accessor: "employeeName" },
                { header: "Department", accessor: "departmentName" },
                { header: "Count", accessor: "expenseCount" },
                {
                  header: "Total Amount",
                  accessor: "totalAmount",
                  format: formatCurrency,
                },
                {
                  header: "Average",
                  accessor: "averageAmount",
                  format: formatCurrency,
                },
              ]}
              onExport={handleExport}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Reports</h1>
          <p className="mt-2 text-sm text-gray-600">
            Analyze expense data and generate insights
          </p>
        </div>
        <ExportButton onExport={handleExport} disabled={!reportData} />
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 mb-4">
          {REPORT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setReportType(type.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                reportType === type.value
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <ReportFilters
          filters={filters}
          onChange={setFilters}
          showDepartment={reportType === "department"}
          showCategory={reportType === "category"}
          showLimit={reportType === "top-spenders"}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">{renderReport()}</div>
    </div>
  );
}

