/**
 * Payroll Reports Page
 */

import { useState, useEffect } from "react";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportChart from "../../components/reports/ReportChart";
import ReportTable from "../../components/reports/ReportTable";
import ExportButton from "../../components/reports/ExportButton";
import { getPayrollReports, exportReport } from "../../api/reports";
import {
  PayrollReportType,
  ReportFilters as ReportFiltersType,
} from "../../types/report";
import { formatCurrency } from "../../utils/format";

const REPORT_TYPES: Array<{ value: PayrollReportType; label: string }> = [
  { value: "summary", label: "Monthly Summary" },
  { value: "department", label: "Department Breakdown" },
  { value: "tax", label: "Tax Summary" },
  { value: "trends", label: "Trends" },
];

export default function PayrollReportsPage() {
  const [reportType, setReportType] = useState<PayrollReportType>("summary");
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
      const response = await getPayrollReports(reportType, filters);
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
      const blob = await exportReport(`payroll:${reportType}`, format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payroll-${reportType}-${filters.startDate}-to-${filters.endDate}.${format === "excel" ? "xlsx" : format}`;
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
      case "summary":
        return (
          <>
            <ReportChart
              data={safeReportData}
              type="bar"
              dataKey="month"
              valueKey="totalNet"
              height={300}
            />
            <ReportTable
              data={safeReportData}
              columns={[
                { header: "Month", accessor: "month" },
                { header: "Employees", accessor: "employeeCount" },
                {
                  header: "Total Gross",
                  accessor: "totalGross",
                  format: formatCurrency,
                },
                {
                  header: "Total Deductions",
                  accessor: "totalDeductions",
                  format: formatCurrency,
                },
                {
                  header: "Total Net",
                  accessor: "totalNet",
                  format: formatCurrency,
                },
                {
                  header: "PAYE",
                  accessor: "totalPAYE",
                  format: formatCurrency,
                },
                {
                  header: "NSSF",
                  accessor: "totalNSSF",
                  format: formatCurrency,
                },
                {
                  header: "NHIF",
                  accessor: "totalNHIF",
                  format: formatCurrency,
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
              valueKey="totalGross"
              height={300}
            />
            <ReportTable
              data={safeReportData}
              columns={[
                { header: "Department", accessor: "departmentName" },
                { header: "Employees", accessor: "employeeCount" },
                {
                  header: "Total Gross",
                  accessor: "totalGross",
                  format: formatCurrency,
                },
                {
                  header: "Total Net",
                  accessor: "totalNet",
                  format: formatCurrency,
                },
              ]}
              onExport={handleExport}
            />
          </>
        );

      case "tax":
        const taxData = (reportData as any).breakdown || [];
        return (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total PAYE</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency((reportData as any).totalPAYE || 0)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total NSSF</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency((reportData as any).totalNSSF || 0)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total NHIF</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency((reportData as any).totalNHIF || 0)}
                </p>
              </div>
            </div>
            <ReportChart
              data={taxData}
              type="line"
              dataKey="month"
              valueKey="paye"
              height={300}
            />
            <ReportTable
              data={taxData}
              columns={[
                { header: "Month", accessor: "month" },
                { header: "PAYE", accessor: "paye", format: formatCurrency },
                { header: "NSSF", accessor: "nssf", format: formatCurrency },
                { header: "NHIF", accessor: "nhif", format: formatCurrency },
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
              valueKey="totalGross"
              height={300}
            />
            <ReportTable
              data={safeReportData}
              columns={[
                { header: "Month", accessor: "month" },
                {
                  header: "Total Gross",
                  accessor: "totalGross",
                  format: formatCurrency,
                },
                {
                  header: "Total Net",
                  accessor: "totalNet",
                  format: formatCurrency,
                },
                { header: "Employees", accessor: "employeeCount" },
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
          <h1 className="text-3xl font-bold text-gray-900">Payroll Reports</h1>
          <p className="mt-2 text-sm text-gray-600">
            Analyze payroll data and generate insights
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
                  ? "bg-blue-600 text-white"
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
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">{renderReport()}</div>
    </div>
  );
}

